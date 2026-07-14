import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';

const AdminAuthContext = createContext(null);

// Deliberately its own provider/context — the backend keeps admin auth
// (session["admin_id"]) and customer auth (session["user_id"]) fully
// separate, so the frontend mirrors that rather than overloading the
// customer AuthContext for admin routes.
export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null); // { username } | null
  const [checking, setChecking] = useState(true);

  const checkSession = useCallback(async () => {
    setChecking(true);
    try {
      const data = await api.adminSession();
      setAdmin(data.authenticated ? { username: data.username } : null);
    } catch {
      setAdmin(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  const login = useCallback(async (username, password) => {
    const data = await api.adminLogin(username, password);
    if (data.username) setAdmin({ username: data.username });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.adminLogout(); } catch { /* clear local state anyway */ }
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, isAdmin: !!admin, checking, login, logout, checkSession }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
