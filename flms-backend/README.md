# FLMS Backend — FastAPI + SQLite

## 🚀 Quick Start

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment file
cp .env.example .env

# 5. Seed the database with sample data
python seed.py

# 6. Start the server
uvicorn app.main:app --reload
```

Server runs at: **http://localhost:8000**
API Docs (Swagger): **http://localhost:8000/docs**

---

## 🔑 Demo Accounts

| Role      | Email              | Password    |
|-----------|--------------------|-------------|
| Admin     | admin@flms.dz      | admin123    |
| Librarian | sara@flms.dz       | lib123      |
| Faculty   | karim@flms.dz      | faculty123  |
| Student   | amina@flms.dz      | student123  |

---

## 📁 Structure

```
app/
├── core/
│   ├── config.py       # Settings from .env
│   ├── database.py     # SQLAlchemy engine + session
│   └── security.py     # JWT, bcrypt, token blacklist
├── models/
│   ├── user.py         # User table
│   ├── book.py         # Book table
│   └── loan.py         # Loan table
├── routers/
│   ├── auth.py         # /auth/*
│   ├── books.py        # /books/*
│   ├── loans.py        # /loans/*
│   ├── users.py        # /users/*
│   └── stats.py        # /stats
├── schemas/
│   └── __init__.py     # Pydantic models
└── main.py             # App entry point
seed.py                 # Sample data loader
```

---

## 🔌 API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login, get JWT token |
| POST | /auth/logout | Auth | Invalidate token |
| GET  | /auth/me | Auth | Get own profile |
| PATCH| /auth/me | Auth | Update own profile |
| GET  | /books | Auth | List books (search/filter/paginate) |
| GET  | /books/{id} | Auth | Get single book |
| POST | /books | Librarian/Admin | Create book |
| PATCH| /books/{id} | Librarian/Admin | Update book |
| DELETE| /books/{id} | Librarian/Admin | Delete book |
| POST | /books/import | Librarian/Admin | Bulk import |
| POST | /loans/borrow/{book_id} | Auth | Borrow a book |
| POST | /loans/return/{loan_id} | Librarian/Admin | Return a book |
| POST | /loans/renew/{loan_id} | Auth | Renew a loan |
| GET  | /loans/my | Auth | My loans |
| GET  | /loans | Librarian/Admin | All loans |
| GET  | /users | Admin | List all users |
| PATCH| /users/{id} | Admin | Update user |
| GET  | /stats | Auth | Dashboard statistics |
