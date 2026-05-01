import { useState, useEffect } from 'react';
import { loansAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner, EmptyState } from '../components/UI';
import { BookMarked, RotateCcw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const STATUS_BADGE = {
  active:   { cls: 'badge-green',  icon: Clock,          label: 'Active' },
  overdue:  { cls: 'badge-red',    icon: AlertTriangle,  label: 'Overdue' },
  returned: { cls: 'badge-gray',   icon: CheckCircle,    label: 'Returned' },
};

function daysLeft(dueDate) {
  const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  if (diff < 0)  return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return 'Due today';
  return `${diff} days left`;
}

export default function MyLoans() {
  const { user } = useAuth();
  const [loans, setLoans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(null);
  const [alert, setAlert]     = useState(null);

  async function fetchLoans() {
    setLoading(true);
    try { setLoans(await loansAPI.getMyLoans(user.id)); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchLoans(); }, []);

  async function handleRenew(loan) {
    setRenewing(loan.id); setAlert(null);
    try {
      await loansAPI.renew(loan.id, user.role);
      setAlert({ type: 'success', msg: 'Loan renewed successfully!' });
      fetchLoans();
    } catch (err) {
      setAlert({ type: 'error', msg: err?.response?.data?.detail || 'Renewal failed.' });
    } finally { setRenewing(null); }
  }

  const active   = loans.filter(l => l.status !== 'returned');
  const history  = loans.filter(l => l.status === 'returned');
  const QUOTA    = user.role === 'student' ? 5 : 10;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="gold-line" />
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>My Loans</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
          {active.length} active · {QUOTA - active.length} slots remaining
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Quota bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Borrowing Quota</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{active.length} / {QUOTA}</span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(active.length / QUOTA) * 100}%`, background: active.length >= QUOTA ? '#f87171' : 'var(--gold)', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>
      ) : (
        <>
          {/* Active loans */}
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookMarked size={16} color="var(--gold)" /> Active Loans
          </h2>

          {active.length === 0
            ? <EmptyState icon={BookMarked} title="No active loans" subtitle="Browse the catalog to borrow books." />
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
                {active.map(loan => {
                  const s = STATUS_BADGE[loan.status];
                  const Icon = s.icon;
                  return (
                    <div key={loan.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      {/* Book cover thumb */}
                      <div style={{ width: 44, height: 60, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                        {loan.book?.cover
                          ? <img src={loan.book.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><BookMarked size={18} color="var(--border)" /></div>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loan.book?.title}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{loan.book?.author}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span className={`badge ${s.cls}`}><Icon size={10} style={{ marginRight: 3 }} />{s.label}</span>
                          <span style={{ fontSize: 12, color: loan.status === 'overdue' ? '#f87171' : 'var(--text-muted)' }}>
                            Due {loan.due_date} · {daysLeft(loan.due_date)}
                          </span>
                          {loan.renewals_count > 0 && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Renewed {loan.renewals_count}/2×</span>
                          )}
                        </div>
                      </div>

                      {loan.renewals_count < 2 && (
                        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 12, flexShrink: 0 }} disabled={renewing === loan.id} onClick={() => handleRenew(loan)}>
                          {renewing === loan.id ? <Spinner size={13} /> : <><RotateCcw size={12} /> Renew</>}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          {/* History */}
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
            <CheckCircle size={16} /> Borrowing History
          </h2>

          {history.length === 0
            ? <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '20px 0' }}>No returned books yet.</p>
            : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Borrowed</th>
                      <th>Returned</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(loan => (
                      <tr key={loan.id}>
                        <td>
                          <p style={{ fontWeight: 500, fontSize: 14 }}>{loan.book?.title}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.book?.author}</p>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{loan.borrowed_at}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{loan.returned_at || '—'}</td>
                        <td><span className="badge badge-gray">Returned</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}
    </div>
  );
}
