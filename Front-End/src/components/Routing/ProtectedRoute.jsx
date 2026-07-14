import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Wraps a route element and redirects to /login if the visitor isn't
// authenticated, preserving the original destination so Login.jsx can
// send them back after a successful login/signup.
//
// Note: this checks *customer* session state (the same /api/me the rest
// of the app uses). Admin-role verification (Phase 3) will layer on top
// of this once the Admin panel is migrated — it isn't a separate auth
// system today.
export default function ProtectedRoute({ children }) {
  const { isLoggedIn, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return <div style={{ padding: '140px 20px', textAlign: 'center', color: 'var(--muted)' }}>Checking your session…</div>;
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
