import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('login'); // 'login' | 'signup'

  const checkSession = useCallback(async () => {
    try {
      const data = await api.getMe();
      if (data.success) setUser(data.user);
    } catch {
      /* not logged in — fine */
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  const doLogin = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    if (data.success) setUser(data.user);
    return data;
  }, []);

  const doSignup = useCallback(async (name, email, password, confirmPassword) => {
    const data = await api.signup(name, email, password, confirmPassword);
    if (data.success) setUser(data.user);
    return data;
  }, []);

  const doLogout = useCallback(async () => {
    try { await api.logout(); } catch { /* clear local state anyway */ }
    setUser(null);
  }, []);

  const openModal = useCallback((mode = 'login') => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const value = {
    user, checking, isLoggedIn: !!user,
    login: doLogin, signup: doSignup, logout: doLogout,
    modalOpen, modalMode, openModal, closeModal, setModalMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
