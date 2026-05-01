import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../services/api';
import { Alert, Spinner, Pagination, EmptyState, Modal, FormField } from '../components/UI';
import { Users, Edit2, UserCheck, UserX } from 'lucide-react';

const ROLES = ['student', 'faculty', 'librarian', 'admin'];
const ROLE_BADGE = {
  admin:     'badge-purple',
  librarian: 'badge-blue',
  faculty:   'badge-gold',
  student:   'badge-green',
};

export default function UserManagement() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, pageSize: 15 });
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null);
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState({ role: '', is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert]         = useState(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await usersAPI.getUsers({ page, pageSize: 15 });
      let data = res.data;
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department?.toLowerCase().includes(q));
      }
      setUsers(data);
      setPagination({ page: res.page, totalPages: res.totalPages, total: res.total, pageSize: res.pageSize });
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(() => fetchUsers(1), 300); return () => clearTimeout(t); }, [search]);

  function openEdit(user) {
    setSelected(user);
    setForm({ role: user.role, is_active: user.is_active });
    setModal('edit');
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await usersAPI.updateUser(selected.id, form);
      setAlert({ type: 'success', msg: `User "${selected.name}" updated.` });
      setModal(null);
      fetchUsers(pagination.page);
    } catch (err) {
      setAlert({ type: 'error', msg: err?.response?.data?.detail || 'Update failed.' });
    } finally { setSubmitting(false); }
  }

  async function toggleActive(user) {
    try {
      await usersAPI.updateUser(user.id, { is_active: !user.is_active });
      setAlert({ type: 'success', msg: `Account ${user.is_active ? 'deactivated' : 'activated'}.` });
      fetchUsers(pagination.page);
    } catch { setAlert({ type: 'error', msg: 'Action failed.' }); }
  }

  // Stats
  const total     = pagination.total;
  const active    = users.filter(u => u.is_active).length;
  const inactive  = users.filter(u => !u.is_active).length;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="gold-line" />
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>User Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Manage accounts, roles, and access</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: total,    color: 'var(--text-primary)' },
          { label: 'Active',      value: active,   color: 'var(--sage)' },
          { label: 'Inactive',    value: inactive, color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        className="input-base"
        placeholder="Search by name, email, or department…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 20, maxWidth: 400 }}
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" subtitle="Try adjusting your search." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table-base">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `hsl(${user.id * 47 % 360}, 40%, 25%)`,
                        border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600, flexShrink: 0,
                        color: `hsl(${user.id * 47 % 360}, 70%, 70%)`
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${ROLE_BADGE[user.role] || 'badge-gray'}`}>{user.role}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.department || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{user.phone || '—'}</td>
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-ghost"
                        style={{ padding: '5px 8px' }}
                        title="Edit role"
                        onClick={() => openEdit(user)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={user.is_active ? 'btn-danger' : 'btn-outline'}
                        style={{ padding: '5px 8px', fontSize: 12 }}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleActive(user)}
                      >
                        {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...pagination} onChange={fetchUsers} />

      {/* Edit Role Modal */}
      {modal === 'edit' && selected && (
        <Modal title={`Edit User — ${selected.name}`} onClose={() => setModal(null)}>
          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{selected.email}</strong> · {selected.department}
              </p>
            </div>

            <FormField label="Role">
              <select
                className="input-base"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Account Status">
              <select
                className="input-base"
                value={form.is_active ? 'active' : 'inactive'}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Deactivated</option>
              </select>
            </FormField>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn-gold" disabled={submitting}>
                {submitting ? <Spinner size={15} color="#0a0a0f" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
