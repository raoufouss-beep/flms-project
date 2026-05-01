from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List
from math import ceil
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.book import Book
from app.models.loan import Loan
from app.schemas import BookCreate, BookUpdate, BookOut, PaginatedBooks

router = APIRouter(prefix="/books", tags=["Books"])

def _paginate(query, page: int, page_size: int):
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total, ceil(total / page_size) if total else 1

@router.get("", response_model=PaginatedBooks)
def list_books(
    search:       Optional[str] = Query(None),
    category:     Optional[str] = Query(None),
    format:       Optional[str] = Query(None),
    availability: Optional[bool] = Query(None),
    year_min:     Optional[int] = Query(None),
    year_max:     Optional[int] = Query(None),
    page:         int = Query(1, ge=1),
    page_size:    int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Book)
    if search:
        q = q.filter(or_(
            Book.title.ilike(f"%{search}%"),
            Book.author.ilike(f"%{search}%"),
            Book.isbn.ilike(f"%{search}%"),
        ))
    if category:     q = q.filter(Book.category == category)
    if format:       q = q.filter(Book.format == format)
    if availability: q = q.filter(Book.available_copies > 0)
    if year_min:     q = q.filter(Book.year >= year_min)
    if year_max:     q = q.filter(Book.year <= year_max)

    items, total, total_pages = _paginate(q, page, page_size)
    return {"data": items, "page": page, "page_size": page_size, "total": total, "total_pages": total_pages}

@router.get("/categories")
def list_categories(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = db.query(Book.category).distinct().all()
    return sorted([r[0] for r in rows if r[0]])

@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(404, "Book not found.")
    return book

@router.post("", response_model=BookOut, status_code=201)
def create_book(
    data: BookCreate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("librarian", "admin")),
):
    if db.query(Book).filter(Book.isbn == data.isbn).first():
        raise HTTPException(400, "ISBN already exists.")
    book = Book(**data.model_dump(), available_copies=data.total_copies)
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

@router.patch("/{book_id}", response_model=BookOut)
def update_book(
    book_id: int,
    data: BookUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("librarian", "admin")),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(404, "Book not found.")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(book, field, value)
    db.commit()
    db.refresh(book)
    return book

@router.delete("/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("librarian", "admin")),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(404, "Book not found.")
    active = db.query(Loan).filter(
        Loan.book_id == book_id,
        Loan.returned_at == None
    ).first()
    if active:
        raise HTTPException(400, "Cannot delete a resource with active loans.")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted."}

@router.post("/import", status_code=201)
def bulk_import(
    books: List[BookCreate],
    db: Session = Depends(get_db),
    _=Depends(require_roles("librarian", "admin")),
):
    errors = []
    for i, b in enumerate(books):
        if not b.title:  errors.append({"row": i+1, "field": "title",  "reason": "Required"})
        if not b.author: errors.append({"row": i+1, "field": "author", "reason": "Required"})
        if not b.isbn:   errors.append({"row": i+1, "field": "isbn",   "reason": "Required"})
        if db.query(Book).filter(Book.isbn == b.isbn).first():
            errors.append({"row": i+1, "field": "isbn", "reason": f"ISBN {b.isbn} already exists"})

    if errors:
        raise HTTPException(422, detail=errors)

    created = []
    for b in books:
        book = Book(**b.model_dump(), available_copies=b.total_copies)
        db.add(book)
        created.append(book)
    db.commit()
    return {"imported": len(created)}
