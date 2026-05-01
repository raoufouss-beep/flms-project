from sqlalchemy import Column, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Book(Base):
    __tablename__ = "books"

    id               = Column(Integer, primary_key=True, index=True)
    title            = Column(String, nullable=False, index=True)
    author           = Column(String, nullable=False, index=True)
    isbn             = Column(String, unique=True, index=True, nullable=False)
    publisher        = Column(String, nullable=True)
    year             = Column(Integer, nullable=True)
    edition          = Column(String, nullable=True)
    category         = Column(String, nullable=True, index=True)
    tags             = Column(JSON, default=list)
    format           = Column(String, default="physical")   # physical | digital
    total_copies     = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)
    shelf            = Column(String, nullable=True)
    description      = Column(Text, nullable=True)
    cover            = Column(String, nullable=True)

    loans = relationship("Loan", back_populates="book")
