import { AnimatePresence, motion } from 'framer-motion';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const online = useOnlineStatus();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000,
            background: '#ef4444', color: '#fff', textAlign: 'center',
            padding: '8px 16px', fontSize: 12.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <i className="ti ti-wifi-off" /> You're offline — some data may be out of date until your connection returns.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
