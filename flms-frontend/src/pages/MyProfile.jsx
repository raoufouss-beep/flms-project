import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Alert, Spinner, FormField } from '../components/UI';
import { UserCircle, Save } from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Electronics', 'Civil Engineering', 'Mechanical Engineering', 'Library', 'IT', 'Other'];

const ROLE_COLORS = {
  admin:     { badge: 'badge-purple', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', text: '#c4b5fd' },
  librarian: { badge: 'badge-blue',   bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)',  text: '#93c5fd' },
  faculty:   { badge: 'badge-gold',   bg: 'rgba(245,200,66,0.08)',  border: 'rgba(245,200,66,0.2)',  text: '#f5c842' },
  student:   { badge: 'badge-green',  bg: 'rgba(93,163,126,0.08)', border: 'rgba(93,163,126,0.2)', text: '#7ab89a' },
};

const ROLE_PERMS = {
  admin:     ['Full system access', 'User management', 'Catalog management', 'All loans view', 'Role assignment'],
  librarian: ['Catalog management', 'Process returns', 'View all loans', 'Browse catalog'],
  faculty:   ['Borrow up to 10 books', '30-day loan duration', '2 renewals per book', 'Browse catalog'],
  student:   ['Borrow up to 5 books',  '14-day loan duration', '2 renewals per book', 'Browse catalog'],
};

export default function MyProfile() {
  const { user, updateLocalUser } = useAuth();
  const [form, setForm]           = useState({ name: user?.name || '', department: user?.department || '', phone: user?.phone || '' });
  const [loading, setLoading]     = useState(false);
  const [alert, setAlert]         = useState(null);
  const [edited, setEdited]       = useState(false);

  function update(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setEdited(true);
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setAlert({ type: 'error', msg: 'Name cannot be empty.' }); return; }
    setLoading(true); setAlert(null);
    try {
      const updated = await authAPI.updateProfile(user.id, form);
      updateLocalUser(updated);
      setAlert({ type: 'success', msg: 'Profile updated successfully!' });
      setEdited(false);
    } catch (err) {
      setAlert({ type: 'error', msg: err?.response?.data?.detail || 'Update failed.' });
    } finally { setLoading(false); }
  }

  const rc = ROLE_COLORS[user?.role] || ROLE_COLORS.student;
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="gold-line" />
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>View and update your account information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left — identity card */}
        <div>
          {/* Avatar card */}
          <div className="card" style={{ padding: 28, textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: rc.bg, border: `2px solid ${rc.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              fontSize: 26, fontWeight: 700, color: rc.text,
              fontFamily: 'Playfair Display, serif'
            }}>
              {initials}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{user?.email}</p>
            <span className={`badge ${rc.badge}`}>{user?.role}</span>
          </div>

          {/* Permissions */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Your Permissions</p>
            {(ROLE_PERMS[user?.role] || []).map(perm => (
              <div key={perm} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: rc.text, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — edit form */}
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Edit Information</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            You can update your name, department, and phone number. Email and role can only be changed by an admin.
          </p>

          {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

          <form onSubmit={handleSubmit}>
            <FormField label="Full Name">
              <input
                className="input-base"
                placeholder="Your full name"
                value={form.name}
                onChange={update('name')}
              />
            </FormField>

            <FormField label="Email">
              <input
                className="input-base"
                value={user?.email}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </FormField>

            <FormField label="Department">
              <select className="input-base" value={form.department} onChange={update('department')}>
                <option value="">Select department…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>

            <FormField label="Phone Number">
              <input
                className="input-base"
                placeholder="05XX XXX XXX"
                value={form.phone}
                onChange={update('phone')}
              />
            </FormField>

            {/* Read-only info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Role</p>
                <span className={`badge ${rc.badge}`}>{user?.role}</span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Account Status</p>
                <span className="badge badge-green">Active</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-gold"
              disabled={loading || !edited}
              style={{ padding: '11px 24px', opacity: edited ? 1 : 0.5 }}
            >
              {loading ? <><Spinner size={15} color="#0a0a0f" /> Saving...</> : <><Save size={14} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 280px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
