import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useToast } from '../../contexts/ToastContext';
import './admin.css';

const NAV = [
  { to: '/admin', end: true, icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { to: '/admin/categories', icon: 'ti-category', label: 'Categories' },
  { to: '/admin/businesses', icon: 'ti-building-store', label: 'Businesses' },
  { to: '/admin/products', icon: 'ti-package', label: 'Products' },
  { to: '/admin/import', icon: 'ti-file-upload', label: 'Import Wizard' },
  { to: '/admin/feedback', icon: 'ti-message-2', label: 'Feedback' },
  { to: '/admin/settings', icon: 'ti-settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast.info('Logged out of admin.');
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-brand">
          <i className="ti ti-bolt" style={{ color: '#4f46e5' }} /> Think<span className="accent">Easy</span>
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`ti ${item.icon}`} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">{(admin?.username || '?').charAt(0).toUpperCase()}</div>
          <div className="admin-sidebar-username">{admin?.username}</div>
          <button className="admin-logout-btn" aria-label="Log out" title="Log out" onClick={handleLogout}>
            <i className="ti ti-logout" />
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
