import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);
let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const toast = useCallback((message, opts = {}) => {
    const id = ++idSeq;
    const type = opts.type || 'info'; // 'success' | 'error' | 'info'
    const duration = opts.duration ?? 3800;
    setToasts((list) => [...list, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  toast.success = (msg, opts) => toast(msg, { ...opts, type: 'success' });
  toast.error = (msg, opts) => toast(msg, { ...opts, type: 'error' });
  toast.info = (msg, opts) => toast(msg, { ...opts, type: 'info' });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="te-toast-stack" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`te-toast te-toast-${t.type}`}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={() => dismiss(t.id)}
            >
              <i className={`ti ${t.type === 'success' ? 'ti-circle-check' : t.type === 'error' ? 'ti-alert-circle' : 'ti-info-circle'}`} />
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
