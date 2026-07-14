import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as api from '../../services/api';
import { voterToken, timeAgoShort } from '../../utils/feedbackShared';
import FeedbackForm from './FeedbackForm';
import StatusBadge from './StatusBadge';

export default function FeedbackWidget({ context }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('submit');
  const [trending, setTrending] = useState(null);
  const [sort, setSort] = useState('popular');
  const [votedIds, setVotedIds] = useState(new Set());

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function onKeydown(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, []);

  useEffect(() => {
    if (open && tab === 'trending') loadTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, sort]);

  async function loadTrending() {
    setTrending(null);
    try {
      const [items, vd] = await Promise.all([
        api.getTrendingFeedback(sort),
        api.getFeedbackVotes(voterToken()),
      ]);
      setVotedIds(new Set(vd.voted_ids || []));
      setTrending(Array.isArray(items) ? items : []);
    } catch {
      setTrending([]);
    }
  }

  async function doVote(id) {
    const voted = votedIds.has(id);
    try {
      const d = await api.voteFeedback(id, voterToken(), voted ? 'unvote' : 'vote');
      setTrending((list) => list.map((item) => (item.id === id ? { ...item, vote_count: d.vote_count } : item)));
      setVotedIds((prev) => {
        const next = new Set(prev);
        if (d.voted) next.add(id); else next.delete(id);
        return next;
      });
    } catch { /* noop */ }
  }

  return (
    <>
      <motion.button
        className="fb-fab" type="button" aria-label="Open Feedback" onClick={() => setOpen(true)}
        whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
      >
        <span className="fb-fab-ico">💬</span><span className="fb-fab-label">Feedback</span>
        <span className="fb-fab-pulse" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fb-overlay open" role="dialog" aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          >
            <motion.div
              className="fb-modal"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <div className="fb-modal-head">
                <div className="fb-modal-headleft">
                  <div className="fb-modal-emoji">💬</div>
                  <div>
                    <div className="fb-modal-title">Feedback Center</div>
                    <div className="fb-modal-sub">Help shape ThinkEasy</div>
                  </div>
                </div>
                <button className="fb-modal-close" type="button" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
              </div>

              <div className="fb-tabs">
                <button className={`fb-tab${tab === 'submit' ? ' active' : ''}`} type="button" onClick={() => setTab('submit')}>✍️ Share</button>
                <button className={`fb-tab${tab === 'trending' ? ' active' : ''}`} type="button" onClick={() => setTab('trending')}>🚀 Trending</button>
              </div>

              <div className="fb-modal-body">
                <div className={`fb-panel${tab === 'submit' ? ' active' : ''}`}>
                  <FeedbackForm context={context} onSeeTrending={() => setTab('trending')} />
                </div>

                <div className={`fb-panel${tab === 'trending' ? ' active' : ''}`}>
                  <div className="fb-trend-toolbar">
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>Vote for features you want</span>
                    <select className="fb-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="popular">🔥 Popular</option>
                      <option value="newest">🆕 Newest</option>
                      <option value="updated">🔄 Updated</option>
                    </select>
                  </div>
                  <div className="fb-trend-list">
                    {trending === null && <div className="fb-trend-empty">Loading…</div>}
                    {trending?.length === 0 && <div className="fb-trend-empty">No trending requests yet.<br />Be the first to suggest one! 🚀</div>}
                    {trending?.map((item) => (
                      <div key={item.id} className={`fb-trend-card${item.is_pinned ? ' pinned' : ''}`}>
                        <button type="button" className={`fb-vote-btn${votedIds.has(item.id) ? ' voted' : ''}`} onClick={() => doVote(item.id)}>
                          <span className="arrow">▲</span><span className="vcount">{item.vote_count}</span>
                        </button>
                        <div className="fb-trend-body">
                          <div className="fb-trend-cat">{item.category}{item.is_pinned ? ' 📌' : ''}</div>
                          <div className="fb-trend-title">{item.subject}</div>
                          <div className="fb-trend-meta">
                            <StatusBadge status={item.status} />
                            <span className="fb-trend-date">{timeAgoShort(item.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
