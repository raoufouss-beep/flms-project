import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Alert, Spinner, FormField } from '../components/UI';
import { BookOpen } from 'lucide-react';

const ROLES        = ['student', 'faculty'];
const DEPARTMENTS  = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Electronics', 'Civil Engineering', 'Mechanical Engineering', 'Library', 'IT', 'Other'];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'student', department: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  function update(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.department) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.register(form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'fixed', top: '15%', left: '8%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,200,66,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }} className="animate-fadeUp">
          <div style={{ width: 52, height: 52, background: 'var(--gold)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <BookOpen size={24} color="#0a0a0f" />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Join the Faculty Library Management System</p>
        </div>

        <div className="card animate-fadeUp stagger-1" style={{ padding: 32 }}>
          <Alert type="error"   message={error}   onClose={() => setError('')} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit}>
            <FormField label="Full Name">
              <input className="input-base" placeholder="Your full name" value={form.name} onChange={update('name')} />
            </FormField>

            <FormField label="Email">
              <input className="input-base" type="email" placeholder="you@university.dz" value={form.email} onChange={update('email')} />
            </FormField>

            <FormField label="Password">
              <input className="input-base" type="password" placeholder="Min. 6 characters" value={form.password} onChange={update('password')} />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Role">
                <select className="input-base" value={form.role} onChange={update('role')}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </FormField>
              <FormField label="Department">
                <select className="input-base" value={form.department} onChange={update('department')}>
                  <option value="">Select...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </FormField>
            </div>

            <button className="btn-gold" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}>
              {loading ? <><Spinner size={16} color="#0a0a0f" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
