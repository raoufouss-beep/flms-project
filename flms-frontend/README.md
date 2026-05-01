# FLMS — Faculty Library Management System
### Frontend — React + Vite + Tailwind CSS

Academic Year 2025–2026 | 3rd Year AI Students

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

---

## 🔑 Demo Accounts

| Role      | Email              | Password    |
|-----------|--------------------|-------------|
| Admin     | admin@flms.dz      | admin123    |
| Librarian | sara@flms.dz       | lib123      |
| Faculty   | karim@flms.dz      | faculty123  |
| Student   | amina@flms.dz      | student123  |

---

## 🛠️ Tech Stack

| Tool            | Why                                               |
|-----------------|---------------------------------------------------|
| React 18        | Component-based UI, large ecosystem               |
| Vite            | Fast dev server, instant HMR                      |
| React Router v6 | Client-side routing with role-based guards        |
| Tailwind CSS    | Utility-first styling, responsive out of the box  |
| Axios           | HTTP client for API calls                         |
| Lucide React    | Consistent icon set                               |

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Login.jsx               # Public login page
│   ├── Register.jsx            # Public registration
│   ├── Catalog.jsx             # Book catalog with search & filters
│   ├── ResourceDetail.jsx      # Single book detail + borrow
│   ├── MyLoans.jsx             # Active loans + history + renew
│   ├── CatalogManagement.jsx   # Librarian/Admin: CRUD + bulk import
│   ├── AllLoans.jsx            # Librarian/Admin: all loans + return
│   ├── UserManagement.jsx      # Admin: manage users & roles
│   └── MyProfile.jsx           # Edit own profile
├── components/
│   ├── Layout.jsx              # Sidebar + mobile nav
│   ├── ProtectedRoute.jsx      # Role-based route guard
│   └── UI.jsx                  # Spinner, Alert, Modal, Pagination...
├── context/
│   └── AuthContext.jsx         # Global auth state
├── services/
│   └── api.js                  # All API calls (mock + real toggle)
├── App.jsx                     # Router setup
├── main.jsx                    # Entry point
└── index.css                   # Design system + global styles
```

---

## 🔌 Connecting to a Real Backend

When your backend is ready, open `src/services/api.js` and:

1. Set `USE_REAL_API = true`
2. Replace each mock function with a real `axios` call

Example:
```js
// MOCK (current)
async login(email, password) {
  await delay(400);
  const user = mockUsers.find(...);
  ...
}

// REAL (swap to this)
async login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}
```

---

## ✅ Features Implemented

- [x] Login & Registration with validation
- [x] Role-based access (Student / Faculty / Librarian / Admin)
- [x] Catalog browse with search, filters, pagination
- [x] Resource detail page with borrow button
- [x] My Loans: active, overdue, renew, history
- [x] Catalog Management: add, edit, delete, bulk import (JSON)
- [x] All Loans: filter, process returns
- [x] User Management: edit role, activate/deactivate
- [x] My Profile: edit name, department, phone
- [x] Responsive design (desktop + mobile)
- [x] Loading states & error messages
- [x] Session persistence (localStorage)
- [x] Expired session redirect to login

---

## 📝 Notes

- Mock data is stored in memory — it resets on page refresh
- All API calls are in `services/api.js` — easy to swap to real backend
- No secrets are committed — use `.env` for configuration
