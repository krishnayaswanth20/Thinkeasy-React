import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { API_URL } from '../../../services/api';
import Button from '../../../components/Buttons/Button';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminSettings() {
  const { admin, logout } = useAdminAuth();
  const toast = useToast();

  async function handleLogout() {
    await logout();
    toast.info('Logged out of admin.');
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Settings</div>
          <div className="admin-page-sub">Account &amp; environment info</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title" style={{ marginBottom: 14 }}>Signed in as</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="admin-sidebar-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>
            {(admin?.username || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{admin?.username}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>ThinkEasy Admin</div>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <Button variant="ghost" icon="ti-logout" onClick={handleLogout}>Log out</Button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title" style={{ marginBottom: 10 }}>API Connection</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          This panel talks to: <code style={{ color: 'var(--text)' }}>{API_URL}</code>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title" style={{ marginBottom: 10 }}>Password &amp; account changes</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          Admin credentials are bootstrapped from environment variables on
          the server (<code>ADMIN_BOOTSTRAP_USERNAME</code>,{' '}
          <code>ADMIN_BOOTSTRAP_PASSWORD</code>) rather than managed in the
          UI — the backend doesn't currently expose an endpoint to change
          the admin password or create additional admin accounts from
          here. To rotate credentials, update those environment variables
          wherever the API is deployed.
        </p>
      </div>
    </div>
  );
}
