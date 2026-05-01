import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LayoutDashboard, BookMarked, Users, Library, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const ROLE_COLORS = { admin: 'badge-purple', librarian: 'badge-blue', faculty: 'badge-gold', student: 'badge-green' };

export default function Layout({ children }) {
  const { user, logout, canManage, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() { await logout(); navigate('/login'); }

  const links = [
    { to: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard',       show: true },
    { to: '/catalog',            icon: BookOpen,        label: 'Catalog',         show: true },
    { to: '/my-loans',           icon: BookMarked,      label: 'My Loans',        show: true },
    { to: '/catalog-management', icon: Library,         label: 'Manage Catalog',  show: canManage },
    { to: '/all-loans',          icon: LayoutDashboard, label: 'All Loans',       show: canManage },
    { to: '/user-management',    icon: Users,           label: 'Users',           show: isAdmin },
    { to: '/profile',            icon: UserCircle,      label: 'My Profile',      show: true },
  ].filter(l => l.show);

  const SidebarContent = () => (
    <>
      <div className="px-6 pb-6 mb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, background: 'var(--gold)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={17} color="#0a0a0f" />
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18 }}>FLMS</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Faculty Library System</p>
      </div>

      <div style={{ padding: '0 12px', marginBottom: 12 }}>
        <div style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.12)', borderRadius: 10, padding: '10px 12px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{user?.name}</p>
          <span className={`badge ${ROLE_COLORS[user?.role]}`}>{user?.role}</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 8px' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <Icon size={15} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 8px 0', borderTop: '1px solid var(--border)' }}>
        <button className="sidebar-link btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 8 }} onClick={handleLogout}>
          <LogOut size={15} /><span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileOpen(false)} />
          <aside style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', padding: '24px 0', display: 'flex', flexDirection: 'column', zIndex: 101 }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setMobileOpen(false)}>
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="main-content" style={{ flex: 1 }}>
        <div className="md-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'var(--gold)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={14} color="#0a0a0f" />
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 16 }}>FLMS</span>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
        </div>

        <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <style>{`
        .md-topbar { display: none !important; }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .md-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
