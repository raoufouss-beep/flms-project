from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional
from datetime import date, timedelta
from math import ceil
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.loan import Loan
from app.models.book import Book
from app.models.user import User
from app.schemas import LoanOut, PaginatedLoans

router = APIRouter(prefix="/loans", tags=["Loans"])

QUOTAS    = {"student": 5,  "faculty": 10, "librarian": 10, "admin": 10}
DURATIONS = {"student": 14, "faculty": 30, "librarian": 30, "admin": 30}

def _paginate(query, page, page_size):
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total, ceil(total / page_size) if total else 1

@router.post("/borrow/{book_id}", response_model=LoanOut, status_code=201)
def borrow(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Lock the book row for atomic update
    book = db.query(Book).with_for_update().filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(404, "Book not found.")
    if book.available_copies <= 0:
        raise HTTPException(400, "No copies available.")

    active_loans = db.query(Loan).filter(
        Loan.user_id == current_user.id,
        Loan.returned_at == None
    ).count()
    if active_loans >= QUOTAS.get(current_user.role, 5):
        raise HTTPException(400, f"Borrowing quota reached ({QUOTAS[current_user.role]} books max).")

    already = db.query(Loan).filter(
        Loan.user_id == current_user.id,
        Loan.book_id == book_id,
        Loan.returned_at == None
    ).first()
    if already:
        raise HTTPException(400, "You already have this book on active loan.")

    duration = DURATIONS.get(current_user.role, 14)
    today    = date.today()
    loan     = Loan(
        user_id=current_user.id,
        book_id=book_id,
        borrowed_at=today,
        due_date=today + timedelta(days=duration),
    )
    book.available_copies -= 1
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return _loan_with_status(loan)

@router.post("/return/{loan_id}", response_model=LoanOut)
def return_book(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("librarian", "admin")),
):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(404, "Loan not found.")
    if loan.returned_at:
        raise HTTPException(400, "Book already returned.")

    loan.returned_at = date.today()
    book = db.query(Book).filter(Book.id == loan.book_id).first()
    if book:
        book.available_copies += 1
    db.commit()
    db.refresh(loan)
    return _loan_with_status(loan)

@router.post("/renew/{loan_id}", response_model=LoanOut)
def renew(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loan = db.query(Loan).filter(
        Loan.id == loan_id,
        Loan.user_id == current_user.id
    ).first()
    if not loan:
        raise HTTPException(404, "Loan not found.")
    if loan.returned_at:
        raise HTTPException(400, "Loan already returned.")
    if loan.renewals_count >= 2:
        raise HTTPException(400, "Maximum renewals (2) reached.")

    duration         = DURATIONS.get(current_user.role, 14)
    loan.due_date    = loan.due_date + timedelta(days=duration)
    loan.renewals_count += 1
    db.commit()
    db.refresh(loan)
    return _loan_with_status(loan)

@router.get("/my", response_model=list[LoanOut])
def my_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loans = db.query(Loan).filter(Loan.user_id == current_user.id)\
              .order_by(Loan.borrowed_at.desc()).all()
    return [_loan_with_status(l) for l in loans]

@router.get("", response_model=PaginatedLoans)
def all_loans(
    user_id:   Optional[int] = Query(None),
    book_id:   Optional[int] = Query(None),
    status:    Optional[str] = Query(None),
    page:      int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(require_roles("librarian", "admin")),
):
    q = db.query(Loan)
    if user_id: q = q.filter(Loan.user_id == user_id)
    if book_id: q = q.filter(Loan.book_id == book_id)
    q = q.order_by(Loan.borrowed_at.desc())

    items, total, total_pages = _paginate(q, page, page_size)
    result = [_loan_with_status(l) for l in items]

    if status:
        result = [l for l in result if l["status"] == status]

    return {"data": result, "page": page, "page_size": page_size, "total": total, "total_pages": total_pages}

def _loan_with_status(loan: Loan) -> dict:
    today = date.today()
    if loan.returned_at:
        s = "returned"
    elif loan.due_date < today:
        s = "overdue"
    else:
        s = "active"
    return {
        "id": loan.id,
        "user_id": loan.user_id,
        "book_id": loan.book_id,
        "borrowed_at": loan.borrowed_at,
        "due_date": loan.due_date,
        "returned_at": loan.returned_at,
        "renewals_count": loan.renewals_count,
        "status": s,
        "book": loan.book,
        "user": loan.user,
    }
