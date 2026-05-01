import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login              from './pages/Login';
import Register           from './pages/Register';
import Dashboard          from './pages/Dashboard';
import Catalog            from './pages/Catalog';
import ResourceDetail     from './pages/ResourceDetail';
import MyLoans            from './pages/MyLoans';
import CatalogManagement  from './pages/CatalogManagement';
import AllLoans           from './pages/AllLoans';
import UserManagement     from './pages/UserManagement';
import MyProfile          from './pages/MyProfile';

function PrivatePage({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* All authenticated */}
          <Route path="/dashboard"   element={<PrivatePage><Dashboard /></PrivatePage>} />
          <Route path="/catalog"     element={<PrivatePage><Catalog /></PrivatePage>} />
          <Route path="/catalog/:id" element={<PrivatePage><ResourceDetail /></PrivatePage>} />
          <Route path="/my-loans"    element={<PrivatePage><MyLoans /></PrivatePage>} />
          <Route path="/profile"     element={<PrivatePage><MyProfile /></PrivatePage>} />

          {/* Librarian + Admin */}
          <Route path="/catalog-management" element={<PrivatePage roles={['librarian','admin']}><CatalogManagement /></PrivatePage>} />
          <Route path="/all-loans"          element={<PrivatePage roles={['librarian','admin']}><AllLoans /></PrivatePage>} />

          {/* Admin only */}
          <Route path="/user-management" element={<PrivatePage roles={['admin']}><UserManagement /></PrivatePage>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
