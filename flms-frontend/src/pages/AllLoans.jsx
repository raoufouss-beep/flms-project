import { useState, useEffect, useCallback } from 'react';
import { loansAPI } from '../services/api';
import { Alert, Spinner, Pagination, EmptyState } from '../components/UI';
import { LayoutDashboard, CornerDownLeft, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const STATUS_BADGE = {
  active:   { cls: 'badge-green', icon: Clock,          label: 'Active' },
  overdue:  { cls: 'badge-red',   icon: AlertTriangle,  label: 'Overdue' },
  returned: { cls: 'badge-gray',  icon: CheckCircle,    label: 'Returned' },
};

export default function AllLoans() {
  const [loans, setLoans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, pageSize: 15 });
  const [filters, setFilters]     = useState({ userId: '', bookId: '', status: '' });
  const [returning, setReturning] = useState(null);
  const [alert, setAlert]         = useState(null);

  const fetchLoans = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await loansAPI.getAllLoans({ ...filters, page, pageSize: 15 });
      setLoans(res.data);
      setPagination({ page: res.page, totalPages: res.totalPages, total: res.total, pageSize: res.pageSize });
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchLoans(1); }, [fetchLoans]);

  async function handleReturn(loan) {
    setReturning(loan.id); setAlert(null);
    try {
      await loansAPI.returnBook(loan.id);
      setAlert({ type: 'success', msg: `"${loan.book?.title}" returned successfully.` });
      fetchLoans(pagination.page);
    } catch (err) { setAlert({ type: 'error', msg: 'Failed to process return.' }); }
    finally { setReturning(null); }
  }

  // Stats summary
  const stats = {
    total:    loans.length,
    active:   loans.filter(l => l.status === 'active').length,
    overdue:  loans.filter(l => l.status === 'overdue').length,
    returned: loans.filter(l => l.status === 'returned').length,
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="gold-line" />
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>All Loans</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>System-wide loan management</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Shown', value: pagination.total, color: 'var(--text-primary)' },
          { label: 'Active',   value: stats.active,   color: 'var(--sage)' },
          { label: 'Overdue',  value: stats.overdue,  color: '#f87171' },
          { label: 'Returned', value: stats.returned, color: 'var(--text-muted)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="input-base" style={{ width: 'auto', minWidth: 140 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
          <option value="returned">Returned</option>
        </select>
        <input className="input-base" placeholder="Filter by User ID" style={{ width: 160 }} value={filters.userId} onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))} type="number" />
        <input className="input-base" placeholder="Filter by Book ID" style={{ width: 160 }} value={filters.bookId} onChange={e => setFilters(f => ({ ...f, bookId: e.target.value }))} type="number" />
        <button className="btn-ghost" onClick={() => setFilters({ userId: '', bookId: '', status: '' })} style={{ fontSize: 13 }}>Clear</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>
      ) : loans.length === 0 ? (
        <EmptyState icon={LayoutDashboard} title="No loans found" subtitle="Try adjusting the filters." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table-base">
            <thead>
              <tr><th>User</th><th>Book</th><th>Borrowed</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loans.map(loan => {
                const s = STATUS_BADGE[loan.status] || STATUS_BADGE.active;
                const Icon = s.icon;
                return (
                  <tr key={loan.id}>
                    <td>
                      <p style={{ fontWeight: 500, fontSize: 13 }}>{loan.user?.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{loan.user?.email} · <span className={`badge badge-${loan.user?.role === 'student' ? 'green' : 'gold'}`} style={{ fontSize: 10, padding: '1px 6px' }}>{loan.user?.role}</span></p>
                    </td>
                    <td>
                      <p style={{ fontWeight: 500, fontSize: 13 }}>{loan.book?.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{loan.book?.author}</p>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{loan.borrowed_at}</td>
                    <td style={{ fontSize: 13, color: loan.status === 'overdue' ? '#f87171' : 'var(--text-primary)' }}>
                      {loan.due_date}
                      {loan.renewals_count > 0 && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Renewed {loan.renewals_count}×</p>}
                    </td>
                    <td><span className={`badge ${s.cls}`}><Icon size={10} style={{ marginRight: 3 }} />{s.label}</span></td>
                    <td>
                      {loan.status !== 'returned' && (
                        <button className="btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} disabled={returning === loan.id} onClick={() => handleReturn(loan)}>
                          {returning === loan.id ? <Spinner size={12} /> : <><CornerDownLeft size={12} /> Return</>}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...pagination} onChange={fetchLoans} />
    </div>
  );
}
