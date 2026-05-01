import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/UI';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Admin',     email: 'admin@flms.dz',   password: 'admin123' },
  { label: 'Librarian', email: 'sara@flms.dz',    password: 'lib123' },
  { label: 'Faculty',   email: 'karim@flms.dz',   password: 'faculty123' },
  { label: 'Student',   email: 'amina@flms.dz',   password: 'student123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/catalog');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  }

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,200,66,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(93,163,126,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36, animation: 'fadeUp 0.5s ease' }}>
          <div style={{ width: 56, height: 56, background: 'var(--gold)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BookOpen size={26} color="#0a0a0f" />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to Faculty Library Management System</p>
        </div>

        {/* Card */}
        <div className="card animate-fadeUp stagger-1" style={{ padding: 32 }}>
          <Alert type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
              <input className="input-base" type="email" placeholder="you@university.dz" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-base" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn-gold" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {loading ? <><Spinner size={16} color="#0a0a0f" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>Register here</Link>
            </p>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="animate-fadeUp stagger-3" style={{ marginTop: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quick Demo Login</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.label} onClick={() => fillDemo(acc)} className="btn-outline" style={{ padding: '8px 12px', fontSize: 12, justifyContent: 'center' }}>
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
