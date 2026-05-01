from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from math import ceil
from app.core.database import get_db
from app.core.security import require_roles
from app.models.user import User
from app.schemas import UserOut, AdminUserUpdate, PaginatedUsers

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=PaginatedUsers)
def list_users(
    page:      int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin")),
):
    q     = db.query(User)
    total = q.count()
    users = q.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "data": users,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": ceil(total / page_size) if total else 1,
    }

@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found.")
    return user

@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found.")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
