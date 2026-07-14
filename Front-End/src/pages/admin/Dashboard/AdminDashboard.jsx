import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as api from '../../../services/api';
import { SkeletonBlock } from '../../../components/Loading/Skeleton';

function timeAgo(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 1) return 'just now';
  if (d < 60) return `${d}m ago`;
  const h = Math.floor(d / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [cats, bizs, prods, fbStats, activity] = await Promise.all([
          api.adminGetCategories(),
          api.adminGetBusinesses(),
          api.adminGetProducts(),
          api.adminFeedbackStats(),
          api.adminActivityLogs(),
        ]);
        if (cancelled) return;
        setCounts({ categories: cats.length, businesses: bizs.length, products: prods.length });
        setStats(fbStats);
        setLogs(activity.slice(0, 8));
      } catch (err) {
        if (!cancelled) setError(err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { icon: 'ti-category', color: '#4f46e5', label: 'Categories', value: counts?.categories },
    { icon: 'ti-building-store', color: '#2563eb', label: 'Businesses', value: counts?.businesses },
    { icon: 'ti-package', color: '#0ea5e9', label: 'Products', value: counts?.products },
    { icon: 'ti-message-2', color: '#10b981', label: 'Total Feedback', value: stats?.total_feedback },
    { icon: 'ti-bug', color: '#ef4444', label: 'Bug Reports', value: stats?.bug_reports },
    { icon: 'ti-clock', color: '#f59e0b', label: 'Pending Feedback', value: stats?.pending },
  ];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Dashboard</div>
          <div className="admin-page-sub">Overview of ThinkEasy's live data</div>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ color: '#ef4444' }}>
          Could not load dashboard data. Make sure the Flask API is reachable and you're signed in.
        </div>
      )}

      <div className="admin-stat-grid">
        {cards.map((c, i) => (
          <motion.div
            key={c.label} className="admin-stat-card"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}
          >
            <div className="admin-stat-icon" style={{ background: `${c.color}1f`, color: c.color }}>
              <i className={`ti ${c.icon}`} />
            </div>
            {c.value == null ? <SkeletonBlock width={50} height={24} /> : <div className="admin-stat-value">{c.value}</div>}
            <div className="admin-stat-label">{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-head"><span className="admin-card-title">Recent Activity</span></div>
        {logs === null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2].map((i) => <SkeletonBlock key={i} height={14} width="70%" />)}
          </div>
        )}
        {logs?.length === 0 && <div className="admin-empty">No recent activity yet.</div>}
        {logs?.map((log) => (
          <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text)' }}><strong>{log.action}</strong> — {log.details}</span>
            <span style={{ color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(log.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
