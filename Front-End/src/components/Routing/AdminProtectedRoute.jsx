import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function AdminProtectedRoute({ children }) {
  const { isAdmin, checking } = useAdminAuth();
  const location = useLocation();

  if (checking) {
    return <div style={{ padding: '140px 20px', textAlign: 'center', color: 'var(--muted)' }}>Checking admin session…</div>;
  }
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}
