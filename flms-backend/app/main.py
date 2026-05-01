from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.core import database
from app.models import User, Book, Loan
from app.routers import auth, books, loans, users, stats

# Create tables on startup
database.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FLMS — Faculty Library Management System",
    description="Backend API for FLMS — 3rd Year AI Project 2025-2026",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(loans.router)
app.include_router(users.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {"message": "FLMS API is running 🚀", "docs": "/docs"}
