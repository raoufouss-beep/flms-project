import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from localStorage on first load
  useEffect(() => {
    const storedToken = localStorage.getItem('flms_token');
    const storedUser  = localStorage.getItem('flms_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const res = await authAPI.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('flms_token', res.token);
    localStorage.setItem('flms_user', JSON.stringify(res.user));
    return res.user;
  }

  async function logout() {
    await authAPI.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('flms_token');
    localStorage.removeItem('flms_user');
  }

  function updateLocalUser(data) {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('flms_user', JSON.stringify(updated));
  }

  const isAdmin     = user?.role === 'admin';
  const isLibrarian = user?.role === 'librarian' || isAdmin;
  const isFaculty   = user?.role === 'faculty';
  const isStudent   = user?.role === 'student';
  const canManage   = isLibrarian; // librarian + admin

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateLocalUser, isAdmin, isLibrarian, isFaculty, isStudent, canManage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
