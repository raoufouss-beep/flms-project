# GitHub Setup Guide — FLMS Project

## 1. Create the Repository

1. Go to https://github.com and log in
2. Click **New repository**
3. Name it: `flms-project` (or similar)
4. Set it to **Public**
5. Do NOT add README/gitignore (you already have them)
6. Click **Create repository**

---

## 2. Initialize Git Locally

Open PowerShell inside your project folder and run:

```bash
# Inside the root folder that contains both frontend and backend
git init
git add .
git commit -m "Initial commit: Add FLMS frontend and backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flms-project.git
git push -u origin main
```

---

## 3. Branching Strategy (Required for Grading)

Each feature must be on its own branch:

```bash
# Create a feature branch
git checkout -b feature/auth-system

# Work on your code...
# Then commit
git add .
git commit -m "feat: implement JWT login and registration"

# Push the branch
git push origin feature/auth-system

# Then open a Pull Request on GitHub to merge into main
```

---

## 4. Good Commit Message Examples

✅ Good:
```
feat: add book search with filters
fix: correct loan due date calculation for faculty
refactor: extract pagination logic into helper
test: add borrow quota enforcement test
```

❌ Bad:
```
fix stuff
update
wip
asdfgh
```

---

## 5. Recommended Branch Structure

```
main                    ← stable, working code only
├── feature/auth        ← register, login, logout
├── feature/catalog     ← books CRUD, search, import
├── feature/loans       ← borrow, return, renew
├── feature/frontend    ← all React pages
└── feature/dashboard   ← stats page
```

---

## 6. Files to NEVER commit

Make sure your `.gitignore` includes:
```
node_modules/
dist/
.env
__pycache__/
*.pyc
venv/
flms.db
```

---

## 7. README Checklist

Your README must include:
- [ ] Project description
- [ ] Tech stack with justification
- [ ] Setup instructions (how to run backend + frontend)
- [ ] Demo accounts table
- [ ] API endpoint list
