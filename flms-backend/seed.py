"""
Run once to populate the database with sample data:
    python seed.py
"""
from app.core.database import engine, SessionLocal
from app.core import database
from app.models import User, Book, Loan
from app.models.user import User
from app.models.book import Book
from app.core.security import hash_password
from datetime import date

def seed():
    # Create all tables
    database.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        # ── Users ──────────────────────────────────────────────────────────
        users = [
            User(name="Admin User",     email="admin@flms.dz",   password_hash=hash_password("admin123"),   role="admin",     department="IT",             is_active=True),
            User(name="Sara Librarian", email="sara@flms.dz",    password_hash=hash_password("lib123"),     role="librarian", department="Library",        is_active=True),
            User(name="Dr. Karim",      email="karim@flms.dz",   password_hash=hash_password("faculty123"), role="faculty",   department="Computer Sci",   is_active=True),
            User(name="Amina Student",  email="amina@flms.dz",   password_hash=hash_password("student123"), role="student",   department="Mathematics",    is_active=True),
            User(name="Youcef Student", email="youcef@flms.dz",  password_hash=hash_password("student123"), role="student",   department="Physics",        is_active=False),
        ]
        db.add_all(users)
        db.commit()

        # ── Books ──────────────────────────────────────────────────────────
        books = [
            Book(title="Clean Code",                          author="Robert C. Martin",    isbn="9780132350884", publisher="Prentice Hall",  year=2008, edition="1st", category="Programming", tags=["software","best practices"], format="physical", total_copies=4, available_copies=2, shelf="A-12", description="A handbook of agile software craftsmanship.", cover="https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg"),
            Book(title="Deep Learning",                       author="Ian Goodfellow",      isbn="9780262035613", publisher="MIT Press",       year=2016, edition="1st", category="AI & ML",    tags=["neural networks","AI"],      format="physical", total_copies=3, available_copies=1, shelf="B-05", description="The definitive textbook on deep learning.",   cover="https://covers.openlibrary.org/b/isbn/9780262035613-M.jpg"),
            Book(title="The Pragmatic Programmer",            author="David Thomas",        isbn="9780201616224", publisher="Addison-Wesley",  year=1999, edition="1st", category="Programming", tags=["career","software"],         format="digital",  total_copies=10,available_copies=10,shelf="Digital", description="Your journey to mastery.", cover="https://covers.openlibrary.org/b/isbn/9780201616224-M.jpg"),
            Book(title="Introduction to Algorithms",         author="Thomas H. Cormen",    isbn="9780262033848", publisher="MIT Press",       year=2009, edition="3rd", category="Algorithms",  tags=["data structures","CS"],      format="physical", total_copies=5, available_copies=0, shelf="C-01", description="The standard reference for algorithms.",     cover="https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg"),
            Book(title="Artificial Intelligence: A Modern Approach", author="Stuart Russell", isbn="9780136042594", publisher="Pearson",     year=2020, edition="4th", category="AI & ML",    tags=["AI","search","logic"],        format="physical", total_copies=6, available_copies=3, shelf="B-10", description="The most widely used AI textbook.", cover="https://covers.openlibrary.org/b/isbn/9780136042594-M.jpg"),
            Book(title="Python Crash Course",                author="Eric Matthes",        isbn="9781593279288", publisher="No Starch Press", year=2019, edition="2nd", category="Programming", tags=["python","beginner"],         format="physical", total_copies=8, available_copies=5, shelf="A-03", description="A hands-on introduction to programming.",   cover="https://covers.openlibrary.org/b/isbn/9781593279288-M.jpg"),
            Book(title="Database System Concepts",           author="Abraham Silberschatz",isbn="9780078022159", publisher="McGraw-Hill",    year=2010, edition="6th", category="Databases",   tags=["SQL","DBMS"],                format="physical", total_copies=4, available_copies=2, shelf="D-07", description="A thorough introduction to databases.",      cover="https://covers.openlibrary.org/b/isbn/9780078022159-M.jpg"),
            Book(title="Computer Networks",                  author="Andrew Tanenbaum",    isbn="9780132126953", publisher="Prentice Hall",  year=2010, edition="5th", category="Networking",  tags=["TCP/IP","protocols"],        format="physical", total_copies=3, available_copies=3, shelf="E-02", description="Top-down approach to computer networks.",   cover="https://covers.openlibrary.org/b/isbn/9780132126953-M.jpg"),
            Book(title="Operating System Concepts",          author="Abraham Silberschatz",isbn="9781118063330", publisher="Wiley",          year=2012, edition="8th", category="Systems",     tags=["OS","memory","processes"],   format="physical", total_copies=5, available_copies=4, shelf="C-15", description="The Dinosaur Book — OS fundamentals.",       cover="https://covers.openlibrary.org/b/isbn/9781118063330-M.jpg"),
            Book(title="Pattern Recognition and Machine Learning", author="Bishop C.M.", isbn="9780387310732", publisher="Springer",        year=2006, edition="1st", category="AI & ML",    tags=["ML","statistics"],           format="digital",  total_copies=10,available_copies=10,shelf="Digital", description="Bayesian perspective on machine learning.", cover="https://covers.openlibrary.org/b/isbn/9780387310732-M.jpg"),
        ]
        db.add_all(books)
        db.commit()

        print("✅ Database seeded successfully!")
        print("\n📋 Demo accounts:")
        print("  admin@flms.dz     / admin123")
        print("  sara@flms.dz      / lib123")
        print("  karim@flms.dz     / faculty123")
        print("  amina@flms.dz     / student123")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
