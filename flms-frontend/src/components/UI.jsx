import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export function Spinner({ size = 20, color = 'var(--gold)' }) {
  return (
    <>
      <div style={{ width: size, height: size, border: `2px solid var(--border)`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  const styles = {
    error:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   color: '#f87171',  Icon: AlertCircle },
    success: { bg: 'rgba(93,163,126,0.1)',  border: 'rgba(93,163,126,0.2)',  color: '#7ab89a',  Icon: CheckCircle },
    info:    { bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)',  color: '#93c5fd',  Icon: Info },
  };
  const s = styles[type];
  const Icon = s.Icon;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
      <Icon size={16} color={s.color} style={{ marginTop: 1, flexShrink: 0 }} />
      <p style={{ fontSize: 13, color: s.color, flex: 1 }}>{message}</p>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.color, padding: 0 }}><X size={14} /></button>}
    </div>
  );
}

export function Pagination({ page, totalPages, total, pageSize, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> results
      </p>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return p <= totalPages ? (
            <button key={p} onClick={() => onChange(p)}
              style={{ padding: '6px 10px', fontSize: 13, background: p === page ? 'var(--gold)' : 'transparent', color: p === page ? '#0a0a0f' : 'var(--text-muted)', border: `1px solid ${p === page ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 6, cursor: 'pointer', fontWeight: p === page ? 600 : 400 }}>
              {p}
            </button>
          ) : null;
        })}
        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next →</button>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: wide ? 680 : 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
      {Icon && <Icon size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />}
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 14 }}>{subtitle}</p>}
    </div>
  );
}

export function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>}
      {children}
      {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>{error}</p>}
    </div>
  );
}
