import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogAPI, loansAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, Pagination, Spinner, EmptyState } from '../components/UI';
import { Search, Filter, BookOpen, BookMarked, Wifi } from 'lucide-react';

function BookCard({ book, onBorrow, borrowing }) {
  const navigate = useNavigate();
  const available = book.available_copies > 0;

  return (
    <div className="card animate-fadeUp" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
      onClick={() => navigate(`/catalog/${book.id}`)}>
      {/* Cover */}
      <div style={{ height: 160, background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {book.cover
          ? <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><BookOpen size={40} color="var(--border)" /></div>}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span className={`badge ${book.format === 'digital' ? 'badge-blue' : 'badge-gray'}`}>
            {book.format === 'digital' ? '⚡ Digital' : '📖 Physical'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{book.category}</p>
        <h3 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{book.author} · {book.year}</p>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: available ? 'var(--sage)' : '#f87171', fontWeight: 500 }}>
            {available ? `${book.available_copies} available` : 'Unavailable'}
          </span>
          <button
            className={available ? 'btn-gold' : 'btn-outline'}
            style={{ padding: '5px 12px', fontSize: 12, opacity: available ? 1 : 0.4 }}
            disabled={!available || borrowing}
            onClick={e => { e.stopPropagation(); onBorrow(book); }}
          >
            {borrowing ? <Spinner size={12} color="#0a0a0f" /> : 'Borrow'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const { user } = useAuth();
  const [books, setBooks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, pageSize: 12 });
  const [filters, setFilters]     = useState({ search: '', category: '', format: '', availability: '', yearMin: '', yearMax: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [borrowing, setBorrowing] = useState(null);
  const [alert, setAlert]         = useState(null);
  const categories                = catalogAPI.getCategories();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await catalogAPI.getBooks({ ...filters, search: debouncedSearch, page, pageSize: 12 });
      setBooks(res.data);
      setPagination({ page: res.page, totalPages: res.totalPages, total: res.total, pageSize: res.pageSize });
    } finally { setLoading(false); }
  }, [debouncedSearch, filters.category, filters.format, filters.availability, filters.yearMin, filters.yearMax]);

  useEffect(() => { fetchBooks(1); }, [fetchBooks]);

  function updateFilter(key) { return e => setFilters(f => ({ ...f, [key]: e.target.value })); }

  async function handleBorrow(book) {
    setBorrowing(book.id);
    setAlert(null);
    try {
      await loansAPI.borrow(user.id, book.id, user.role);
      setAlert({ type: 'success', msg: `"${book.title}" borrowed successfully!` });
      fetchBooks(pagination.page);
    } catch (err) {
      setAlert({ type: 'error', msg: err?.response?.data?.detail || 'Failed to borrow.' });
    } finally { setBorrowing(null); }
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="gold-line" />
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>Book Catalog</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{pagination.total} resources available</p>
          </div>
          <button className="btn-outline" onClick={() => setShowFilters(!showFilters)} style={{ gap: 8 }}>
            <Filter size={15} /> Filters {showFilters ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Alert */}
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: showFilters ? 16 : 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-base" placeholder="Search by title, author, or ISBN…" value={filters.search} onChange={updateFilter('search')} style={{ paddingLeft: 42 }} />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card animate-fadeUp" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
              <select className="input-base" value={filters.category} onChange={updateFilter('category')}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Format</label>
              <select className="input-base" value={filters.format} onChange={updateFilter('format')}>
                <option value="">All Formats</option>
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Availability</label>
              <select className="input-base" value={filters.availability} onChange={updateFilter('availability')}>
                <option value="">All</option>
                <option value="available">Available only</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Year From</label>
              <input className="input-base" type="number" placeholder="1990" value={filters.yearMin} onChange={updateFilter('yearMin')} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Year To</label>
              <input className="input-base" type="number" placeholder="2025" value={filters.yearMax} onChange={updateFilter('yearMax')} />
            </div>
          </div>
          <button className="btn-ghost" style={{ marginTop: 12, fontSize: 12 }} onClick={() => setFilters({ search: '', category: '', format: '', availability: '', yearMin: '', yearMax: '' })}>
            Clear all filters
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 160 }} />
              <div style={{ padding: 14 }}>
                <div className="skeleton" style={{ height: 10, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState icon={BookOpen} title="No books found" subtitle="Try adjusting your search or filters." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {books.map(book => (
            <BookCard key={book.id} book={book} onBorrow={handleBorrow} borrowing={borrowing === book.id} />
          ))}
        </div>
      )}

      <Pagination {...pagination} onChange={fetchBooks} />
    </div>
  );
}
