from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import date, datetime

# ─── AUTH ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name:       str
    email:      EmailStr
    password:   str
    role:       str = "student"
    department: Optional[str] = None
    phone:      Optional[str] = None

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v):
        if v not in ("student", "faculty", "librarian", "admin"):
            raise ValueError("Invalid role")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         "UserOut"

# ─── USERS ───────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id:         int
    name:       str
    email:      str
    role:       str
    department: Optional[str]
    phone:      Optional[str]
    is_active:  bool

    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    name:       Optional[str] = None
    department: Optional[str] = None
    phone:      Optional[str] = None

class AdminUserUpdate(BaseModel):
    role:       Optional[str] = None
    is_active:  Optional[bool] = None
    name:       Optional[str] = None
    department: Optional[str] = None
    phone:      Optional[str] = None

class PaginatedUsers(BaseModel):
    data:        List[UserOut]
    page:        int
    page_size:   int
    total:       int
    total_pages: int

# ─── BOOKS ───────────────────────────────────────────────────────────────────

class BookCreate(BaseModel):
    title:        str
    author:       str
    isbn:         str
    publisher:    Optional[str] = None
    year:         Optional[int] = None
    edition:      Optional[str] = None
    category:     Optional[str] = None
    tags:         Optional[List[str]] = []
    format:       str = "physical"
    total_copies: int = 1
    shelf:        Optional[str] = None
    description:  Optional[str] = None
    cover:        Optional[str] = None

class BookUpdate(BaseModel):
    title:        Optional[str] = None
    author:       Optional[str] = None
    isbn:         Optional[str] = None
    publisher:    Optional[str] = None
    year:         Optional[int] = None
    edition:      Optional[str] = None
    category:     Optional[str] = None
    tags:         Optional[List[str]] = None
    format:       Optional[str] = None
    total_copies: Optional[int] = None
    shelf:        Optional[str] = None
    description:  Optional[str] = None
    cover:        Optional[str] = None
    # available_copies is intentionally excluded

class BookOut(BaseModel):
    id:               int
    title:            str
    author:           str
    isbn:             str
    publisher:        Optional[str]
    year:             Optional[int]
    edition:          Optional[str]
    category:         Optional[str]
    tags:             Optional[List[str]]
    format:           str
    total_copies:     int
    available_copies: int
    shelf:            Optional[str]
    description:      Optional[str]
    cover:            Optional[str]

    model_config = {"from_attributes": True}

class PaginatedBooks(BaseModel):
    data:        List[BookOut]
    page:        int
    page_size:   int
    total:       int
    total_pages: int

# ─── LOANS ───────────────────────────────────────────────────────────────────

class LoanOut(BaseModel):
    id:             int
    user_id:        int
    book_id:        int
    borrowed_at:    date
    due_date:       date
    returned_at:    Optional[date]
    renewals_count: int
    status:         str
    book:           Optional[BookOut] = None
    user:           Optional[UserOut] = None

    model_config = {"from_attributes": True}

class PaginatedLoans(BaseModel):
    data:        List[LoanOut]
    page:        int
    page_size:   int
    total:       int
    total_pages: int

# ─── STATS ───────────────────────────────────────────────────────────────────

class StatsOut(BaseModel):
    total_books:    int
    total_users:    int
    active_loans:   int
    overdue_loans:  int
    returned_loans: int
    total_loans:    int
