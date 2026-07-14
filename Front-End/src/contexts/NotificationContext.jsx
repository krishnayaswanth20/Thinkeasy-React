import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const KEY = 'te_notifications_v1';
const MAX = 30;
const NotificationContext = createContext(null);

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
}

// A genuinely client-side notification log — there's no backend
// notifications table or push mechanism, so this surfaces things that
// actually happened in this browser (feedback you submitted/voted on,
// an import you just ran) rather than fabricating server-pushed events
// like "new business added" that nothing here can actually detect.
export function NotificationProvider({ children }) {
  const [items, setItems] = useState(() => read());

  useEffect(() => { write(items); }, [items]);

  const push = useCallback((notification) => {
    setItems((list) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, read: false, at: Date.now(), ...notification },
      ...list,
    ].slice(0, MAX));
  }, []);

  const markAllRead = useCallback(() => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ items, push, markAllRead, clear, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
