from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.book import Book
from app.models.user import User
from app.models.loan import Loan
from app.schemas import StatsOut

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    today         = date.today()
    total_books   = db.query(Book).count()
    total_users   = db.query(User).count()
    all_loans     = db.query(Loan).all()
    active_loans  = sum(1 for l in all_loans if not l.returned_at and l.due_date >= today)
    overdue_loans = sum(1 for l in all_loans if not l.returned_at and l.due_date < today)
    returned      = sum(1 for l in all_loans if l.returned_at)
    return {
        "total_books":    total_books,
        "total_users":    total_users,
        "active_loans":   active_loans,
        "overdue_loans":  overdue_loans,
        "returned_loans": returned,
        "total_loans":    len(all_loans),
    }
