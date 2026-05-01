import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';
import { BookOpen, Users, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, canManage } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Books',   value: stats.total_books,    icon: BookOpen,      color: '#f5c842', bg: 'rgba(245,200,66,0.1)',  border: 'rgba(245,200,66,0.2)',  link: '/catalog' },
    { label: 'Total Users',   value: stats.total_users,    icon: Users,         color: '#93c5fd', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)',  link: canManage ? '/user-management' : null },
    { label: 'Active Loans',  value: stats.active_loans,   icon: Clock,         color: '#7ab89a', bg: 'rgba(93,163,126,0.1)', border: 'rgba(93,163,126,0.2)', link: canManage ? '/all-loans' : '/my-loans' },
    { label: 'Overdue Loans', value: stats.overdue_loans,  icon: AlertTriangle, color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',  link: canManage ? '/all-loans' : '/my-loans' },
    { label: 'Returned',      value: stats.returned_loans, icon: CheckCircle,   color: '#c4b5fd', bg: 'rgba(167,139,250,0.1)',border: 'rgba(167,139,250,0.2)',link: null },
    { label: 'Total Loans',   value: stats.total_loans,    icon: TrendingUp,    color: '#9090a8', bg: 'rgba(144,144,168,0.1)',border: 'rgba(144,144,168,0.2)',link: null },
  ] : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="gold-line" />
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
          Here's what's happening in the library today.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {cards.map(({ label, value, icon: Icon, color, bg, border, link }, i) => (
            <div key={label} className={`card animate-fadeUp stagger-${i + 1}`}
              style={{ padding: '20px 22px', cursor: link ? 'pointer' : 'default', background: bg, borderColor: border }}
              onClick={() => link && navigate(link)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(0,0,0,0.2)', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color={color} />
                </div>
                {link && <span style={{ fontSize: 11, color, opacity: 0.7 }}>→</span>}
              </div>
              <p style={{ fontSize: 30, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color, marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { label: 'Browse Catalog',  desc: 'Search and borrow books',      icon: BookOpen,   to: '/catalog',            show: true },
          { label: 'My Loans',        desc: 'View active loans & renew',     icon: Clock,      to: '/my-loans',           show: true },
          { label: 'Manage Catalog',  desc: 'Add, edit or delete books',     icon: TrendingUp, to: '/catalog-management', show: canManage },
          { label: 'All Loans',       desc: 'Process returns system-wide',   icon: CheckCircle,to: '/all-loans',          show: canManage },
          { label: 'User Management', desc: 'Manage accounts & roles',       icon: Users,      to: '/user-management',    show: user?.role === 'admin' },
        ].filter(a => a.show).map(({ label, desc, icon: Icon, to }) => (
          <button key={to} className="card btn-ghost"
            style={{ padding: '16px 18px', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}
            onClick={() => navigate(to)}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={17} color="var(--gold)" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}