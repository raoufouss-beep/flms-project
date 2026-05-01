import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogAPI, loansAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/UI';
import { ArrowLeft, BookOpen, MapPin, Hash, Calendar, Building, Tag } from 'lucide-react';

export default function ResourceDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [book, setBook]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [alert, setAlert]     = useState(null);

  useEffect(() => {
    catalogAPI.getBook(parseInt(id))
      .then(setBook)
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBorrow() {
    if (!book) return;
    setBorrowing(true); setAlert(null);
    try {
      await loansAPI.borrow(user.id, book.id, user.role);
      setAlert({ type: 'success', msg: 'Book borrowed successfully! Check My Loans.' });
      setBook(b => ({ ...b, available_copies: b.available_copies - 1 }));
    } catch (err) {
      setAlert({ type: 'error', msg: err?.response?.data?.detail || 'Failed to borrow.' });
    } finally { setBorrowing(false); }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={32} /></div>
  );
  if (!book) return null;

  const available = book.available_copies > 0;

  return (
    <div className="animate-fadeIn">
      <button className="btn-ghost" onClick={() => navigate('/catalog')} style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>
        {/* Cover */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {book.cover
              ? <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              : <BookOpen size={48} color="var(--border)" />}
          </div>

          {/* Borrow action */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Copies available</span>
              <span style={{ fontWeight: 700, color: available ? 'var(--sage)' : '#f87171' }}>{book.available_copies} / {book.total_copies}</span>
            </div>
            <button
              className="btn-gold"
              disabled={!available || borrowing}
              onClick={handleBorrow}
              style={{ width: '100%', justifyContent: 'center', padding: 12, opacity: available ? 1 : 0.4 }}
            >
              {borrowing ? <><Spinner size={16} color="#0a0a0f" /> Borrowing...</> : available ? 'Borrow This Book' : 'Not Available'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>{book.category}</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>{book.title}</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 20 }}>by {book.author}</p>

          {book.description && (
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 28, padding: '16px 20px', background: 'var(--bg-card)', borderRadius: 8, borderLeft: '3px solid var(--gold)' }}>
              {book.description}
            </p>
          )}

          {/* Metadata grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: Hash,     label: 'ISBN',      value: book.isbn },
              { icon: Building, label: 'Publisher', value: book.publisher },
              { icon: Calendar, label: 'Year',      value: `${book.year} (${book.edition} ed.)` },
              { icon: MapPin,   label: 'Shelf',     value: book.shelf },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon size={13} color="var(--gold)" />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {book.tags?.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Tag size={13} color="var(--text-muted)" />
              {book.tags.map(tag => (
                <span key={tag} className="badge badge-gray">{tag}</span>
              ))}
            </div>
          )}

          {/* Format */}
          <div style={{ marginTop: 16 }}>
            <span className={`badge ${book.format === 'digital' ? 'badge-blue' : 'badge-gray'}`}>
              {book.format === 'digital' ? '⚡ Digital Resource' : '📖 Physical Copy'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: 220px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
