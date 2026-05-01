from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Loan(Base):
    __tablename__ = "loans"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id         = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    borrowed_at     = Column(Date, nullable=False)
    due_date        = Column(Date, nullable=False)
    returned_at     = Column(Date, nullable=True)
    renewals_count  = Column(Integer, default=0)
    created_at      = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="loans")
    book = relationship("Book", back_populates="loans")

    @property
    def status(self):
        from datetime import date
        if self.returned_at:
            return "returned"
        if self.due_date < date.today():
            return "overdue"
        return "active"
