from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    email       = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role        = Column(String, default="student")   # student | faculty | librarian | admin
    department  = Column(String, nullable=True)
    phone       = Column(String, nullable=True)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    loans = relationship("Loan", back_populates="user")
