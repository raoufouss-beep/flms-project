// services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Set USE_REAL_API = true to connect to your FastAPI backend.
// Set USE_REAL_API = false to use mock data (no backend needed).
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

export const USE_REAL_API = true; // ← toggle this

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// Attach token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('flms_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('flms_token');
      localStorage.removeItem('flms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── MOCK DATA (used when USE_REAL_API = false) ───────────────────────────────

let mockUsers = [
  { id: 1, name: 'Admin User',     email: 'admin@flms.dz',   password: 'admin123',   role: 'admin',     department: 'IT',           phone: '0555000001', is_active: true },
  { id: 2, name: 'Sara Librarian', email: 'sara@flms.dz',    password: 'lib123',     role: 'librarian', department: 'Library',      phone: '0555000002', is_active: true },
  { id: 3, name: 'Dr. Karim',      email: 'karim@flms.dz',   password: 'faculty123', role: 'faculty',   department: 'Computer Sci', phone: '0555000003', is_active: true },
  { id: 4, name: 'Amina Student',  email: 'amina@flms.dz',   password: 'student123', role: 'student',   department: 'Math',         phone: '0555000004', is_active: true },
];

let mockBooks = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', publisher: 'Prentice Hall', year: 2008, edition: '1st', category: 'Programming', tags: ['software'], format: 'physical', total_copies: 4, available_copies: 2, shelf: 'A-12', description: 'A handbook of agile software craftsmanship.', cover: 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg' },
  { id: 2, title: 'Deep Learning', author: 'Ian Goodfellow', isbn: '9780262035613', publisher: 'MIT Press', year: 2016, edition: '1st', category: 'AI & ML', tags: ['AI'], format: 'physical', total_copies: 3, available_copies: 1, shelf: 'B-05', description: 'The definitive textbook on deep learning.', cover: 'https://covers.openlibrary.org/b/isbn/9780262035613-M.jpg' },
  { id: 3, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262033848', publisher: 'MIT Press', year: 2009, edition: '3rd', category: 'Algorithms', tags: ['CS'], format: 'physical', total_copies: 5, available_copies: 0, shelf: 'C-01', description: 'The standard reference.', cover: 'https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg' },
  { id: 4, title: 'Python Crash Course', author: 'Eric Matthes', isbn: '9781593279288', publisher: 'No Starch Press', year: 2019, edition: '2nd', category: 'Programming', tags: ['python'], format: 'physical', total_copies: 8, available_copies: 5, shelf: 'A-03', description: 'A hands-on introduction to Python.', cover: 'https://covers.openlibrary.org/b/isbn/9781593279288-M.jpg' },
];

let mockLoans = [
  { id: 1, user_id: 4, book_id: 1, borrowed_at: '2025-04-01', due_date: '2025-04-15', returned_at: null, status: 'overdue', renewals_count: 0 },
  { id: 2, user_id: 4, book_id: 2, borrowed_at: '2025-04-10', due_date: '2025-04-24', returned_at: null, status: 'active',  renewals_count: 1 },
];
let nextId = { user: 5, book: 5, loan: 3 };

const delay = ms => new Promise(r => setTimeout(r, ms));

function paginate(items, page = 1, pageSize = 12) {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  return { data: items.slice((page - 1) * pageSize, page * pageSize), page, page_size: pageSize, total, total_pages: totalPages };
}

function addDays(str, days) {
  const d = new Date(str); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0];
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  async login(email, password) {
    if (USE_REAL_API) {
      const res = await api.post('/auth/login', { email, password });
      return { token: res.data.access_token, user: res.data.user };
    }
    await delay(400);
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) throw { response: { data: { detail: 'Invalid email or password.' } } };
    if (!user.is_active) throw { response: { data: { detail: 'Account deactivated.' } } };
    const { password: _, ...safe } = user;
    return { token: btoa(`${user.id}:${Date.now()}`), user: safe };
  },

  async register(data) {
    if (USE_REAL_API) {
      const res = await api.post('/auth/register', data);
      return res.data;
    }
    await delay(500);
    if (mockUsers.find(u => u.email === data.email)) throw { response: { data: { detail: 'Email already registered.' } } };
    const newUser = { id: nextId.user++, ...data, is_active: true };
    mockUsers.push(newUser);
    const { password: _, ...safe } = newUser;
    return safe;
  },

  async logout() {
    if (USE_REAL_API) { try { await api.post('/auth/logout'); } catch {} }
  },

  async updateProfile(userId, data) {
    if (USE_REAL_API) { const res = await api.patch('/auth/me', data); return res.data; }
    await delay(300);
    const idx = mockUsers.findIndex(u => u.id === userId);
    Object.assign(mockUsers[idx], data);
    const { password: _, ...safe } = mockUsers[idx];
    return safe;
  },
};

// ─── CATALOG ──────────────────────────────────────────────────────────────────

export const catalogAPI = {
  async getBooks({ search='', category='', format='', availability='', yearMin='', yearMax='', page=1, pageSize=12 } = {}) {
    if (USE_REAL_API) {
      const params = { page, page_size: pageSize };
      if (search)       params.search = search;
      if (category)     params.category = category;
      if (format)       params.format = format;
      if (availability) params.availability = true;
      if (yearMin)      params.year_min = yearMin;
      if (yearMax)      params.year_max = yearMax;
      const res = await api.get('/books', { params });
      return { data: res.data.data, page: res.data.page, pageSize: res.data.page_size, total: res.data.total, totalPages: res.data.total_pages };
    }
    await delay(300);
    let books = [...mockBooks];
    if (search) { const q = search.toLowerCase(); books = books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q)); }
    if (category)     books = books.filter(b => b.category === category);
    if (format)       books = books.filter(b => b.format === format);
    if (availability) books = books.filter(b => b.available_copies > 0);
    if (yearMin)      books = books.filter(b => b.year >= parseInt(yearMin));
    if (yearMax)      books = books.filter(b => b.year <= parseInt(yearMax));
    const r = paginate(books, page, pageSize);
    return { ...r, totalPages: r.total_pages, pageSize: r.page_size };
  },

  async getBook(id) {
    if (USE_REAL_API) { const res = await api.get(`/books/${id}`); return res.data; }
    await delay(200);
    return mockBooks.find(b => b.id === id);
  },

  async createBook(data) {
    if (USE_REAL_API) { const res = await api.post('/books', data); return res.data; }
    await delay(400);
    const book = { id: nextId.book++, available_copies: data.total_copies, ...data };
    mockBooks.push(book); return book;
  },

  async updateBook(id, data) {
    if (USE_REAL_API) { const res = await api.patch(`/books/${id}`, data); return res.data; }
    await delay(300);
    const idx = mockBooks.findIndex(b => b.id === id);
    const { available_copies, ...safe } = data;
    Object.assign(mockBooks[idx], safe); return mockBooks[idx];
  },

  async deleteBook(id) {
    if (USE_REAL_API) { await api.delete(`/books/${id}`); return { success: true }; }
    await delay(300);
    mockBooks = mockBooks.filter(b => b.id !== id); return { success: true };
  },

  async getCategories() {
    if (USE_REAL_API) { const res = await api.get('/books/categories'); return res.data; }
    return [...new Set(mockBooks.map(b => b.category))].sort();
  },
};

// ─── LOANS ────────────────────────────────────────────────────────────────────

const DURATIONS = { student: 14, faculty: 30, librarian: 30, admin: 30 };
const QUOTAS    = { student: 5,  faculty: 10, librarian: 10, admin: 10 };

export const loansAPI = {
  async borrow(userId, bookId, userRole) {
    if (USE_REAL_API) { const res = await api.post(`/loans/borrow/${bookId}`); return res.data; }
    await delay(400);
    const book = mockBooks.find(b => b.id === bookId);
    if (!book || book.available_copies <= 0) throw { response: { data: { detail: 'No copies available.' } } };
    const active = mockLoans.filter(l => l.user_id === userId && !l.returned_at);
    if (active.length >= QUOTAS[userRole]) throw { response: { data: { detail: 'Quota reached.' } } };
    if (active.find(l => l.book_id === bookId)) throw { response: { data: { detail: 'Already on loan.' } } };
    const today = new Date().toISOString().split('T')[0];
    const loan = { id: nextId.loan++, user_id: userId, book_id: bookId, borrowed_at: today, due_date: addDays(today, DURATIONS[userRole]), returned_at: null, status: 'active', renewals_count: 0 };
    mockLoans.push(loan); book.available_copies--;
    return { ...loan, book };
  },

  async returnBook(loanId) {
    if (USE_REAL_API) { const res = await api.post(`/loans/return/${loanId}`); return res.data; }
    await delay(300);
    const loan = mockLoans.find(l => l.id === loanId);
    loan.returned_at = new Date().toISOString().split('T')[0]; loan.status = 'returned';
    const book = mockBooks.find(b => b.id === loan.book_id);
    if (book) book.available_copies++;
    return loan;
  },

  async renew(loanId, userRole) {
    if (USE_REAL_API) { const res = await api.post(`/loans/renew/${loanId}`); return res.data; }
    await delay(300);
    const loan = mockLoans.find(l => l.id === loanId);
    if (loan.renewals_count >= 2) throw { response: { data: { detail: 'Max renewals reached.' } } };
    loan.due_date = addDays(loan.due_date, DURATIONS[userRole]); loan.renewals_count++;
    return loan;
  },

  async getMyLoans(userId) {
    if (USE_REAL_API) { const res = await api.get('/loans/my'); return res.data; }
    await delay(300);
    const today = new Date().toISOString().split('T')[0];
    return mockLoans.filter(l => l.user_id === userId).map(l => ({
      ...l,
      status: l.returned_at ? 'returned' : l.due_date < today ? 'overdue' : 'active',
      book: mockBooks.find(b => b.id === l.book_id),
    })).sort((a, b) => new Date(b.borrowed_at) - new Date(a.borrowed_at));
  },

  async getAllLoans({ userId='', bookId='', status='', page=1, pageSize=15 } = {}) {
    if (USE_REAL_API) {
      const params = { page, page_size: pageSize };
      if (userId) params.user_id = userId;
      if (bookId) params.book_id = bookId;
      if (status) params.status  = status;
      const res = await api.get('/loans', { params });
      return { data: res.data.data, page: res.data.page, pageSize: res.data.page_size, total: res.data.total, totalPages: res.data.total_pages };
    }
    await delay(300);
    const today = new Date().toISOString().split('T')[0];
    let loans = mockLoans.map(l => ({ ...l, status: l.returned_at ? 'returned' : l.due_date < today ? 'overdue' : 'active', book: mockBooks.find(b => b.id === l.book_id), user: mockUsers.find(u => u.id === l.user_id) }));
    if (userId) loans = loans.filter(l => l.user_id === parseInt(userId));
    if (bookId) loans = loans.filter(l => l.book_id === parseInt(bookId));
    if (status) loans = loans.filter(l => l.status === status);
    const r = paginate(loans, page, pageSize);
    return { ...r, totalPages: r.total_pages, pageSize: r.page_size };
  },
};

// ─── USERS ────────────────────────────────────────────────────────────────────

export const usersAPI = {
  async getUsers({ page=1, pageSize=15 } = {}) {
    if (USE_REAL_API) {
      const res = await api.get('/users', { params: { page, page_size: pageSize } });
      return { data: res.data.data, page: res.data.page, pageSize: res.data.page_size, total: res.data.total, totalPages: res.data.total_pages };
    }
    await delay(300);
    const safe = mockUsers.map(({ password: _, ...u }) => u);
    const r = paginate(safe, page, pageSize);
    return { ...r, totalPages: r.total_pages, pageSize: r.page_size };
  },

  async updateUser(id, data) {
    if (USE_REAL_API) { const res = await api.patch(`/users/${id}`, data); return res.data; }
    await delay(300);
    const idx = mockUsers.findIndex(u => u.id === id);
    Object.assign(mockUsers[idx], data);
    const { password: _, ...safe } = mockUsers[idx];
    return safe;
  },
};

// ─── STATS ────────────────────────────────────────────────────────────────────

export const statsAPI = {
  async getStats() {
    if (USE_REAL_API) { const res = await api.get('/stats'); return res.data; }
    await delay(300);
    const today = new Date().toISOString().split('T')[0];
    return {
      total_books:    mockBooks.length,
      total_users:    mockUsers.length,
      active_loans:   mockLoans.filter(l => !l.returned_at && l.due_date >= today).length,
      overdue_loans:  mockLoans.filter(l => !l.returned_at && l.due_date < today).length,
      returned_loans: mockLoans.filter(l => l.returned_at).length,
      total_loans:    mockLoans.length,
    };
  },
};
