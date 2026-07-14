import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationContext';
import { timeAgoShort } from '../../utils/feedbackShared';

const ICONS = {
  feedback: 'ti-message-2', import: 'ti-file-upload', vote: 'ti-thumb-up', system: 'ti-info-circle',
};

export default function NotificationBell() {
  const { items, unreadCount, markAllRead, clear } = useNotifications();
  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen((v) => {
      const next = !v;
      if (next) markAllRead();
      return next;
    });
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className="te-theme-toggle" type="button" aria-label="Notifications" onClick={toggle} style={{ position: 'relative' }}>
        <i className="ti ti-bell" />
        {unreadCount > 0 && <span className="te-notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="te-notif-backdrop" onClick={() => setOpen(false)} />
            <motion.div
              className="te-notif-panel"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <div className="te-notif-head">
                <span>Notifications</span>
                {items.length > 0 && <button type="button" onClick={clear}>Clear all</button>}
              </div>
              <div className="te-notif-list">
                {items.length === 0 && (
                  <div className="te-notif-empty">
                    <i className="ti ti-bell-off" />
                    Nothing yet — actions like submitting feedback will show up here.
                  </div>
                )}
                {items.map((n) => (
                  <div key={n.id} className="te-notif-item">
                    <div className="te-notif-icon"><i className={`ti ${ICONS[n.type] || ICONS.system}`} /></div>
                    <div>
                      <div className="te-notif-title">{n.title}</div>
                      {n.body && <div className="te-notif-body">{n.body}</div>}
                      <div className="te-notif-time">{timeAgoShort(new Date(n.at).toISOString())}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
