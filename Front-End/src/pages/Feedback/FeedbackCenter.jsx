import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import FeedbackWidget from '../../components/Feedback/FeedbackWidget';
import SEO from '../../components/SEO/SEO';
import FeedbackForm from '../../components/Feedback/FeedbackForm';
import FeedbackCard from '../../components/Feedback/FeedbackCard';
import { CardGridSkeleton, FeedbackCardSkeleton } from '../../components/Loading/Skeleton';
import EmptyState from '../../components/Loading/EmptyState';
import Button from '../../components/Buttons/Button';
import { useFeedbackData, useFeedbackDetailCache, useFilteredFeedback } from '../../hooks/useFeedbackData';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useInfiniteScrollSentinel } from '../../hooks/useInfiniteScrollSentinel';
import '../../styles/feedback-center.css';

const PAGE_SIZE = 8;
const SORT_OPTIONS = [
  { v: 'popular', label: '🔥 Trending' },
  { v: 'newest', label: '🆕 Newest' },
  { v: 'updated', label: '🔄 Recently Updated' },
];

export default function FeedbackCenter() {
  const { meta, items, votedIds, vote } = useFeedbackData();
  const { cache, loadingId, fetchDetail } = useFeedbackDetailCache();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showForm, setShowForm] = useState(false);

  const filtered = useFilteredFeedback(items, { query: debouncedQuery, status, sort });
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const sentinelRef = useInfiniteScrollSentinel(
    () => setVisibleCount((v) => Math.min(v + PAGE_SIZE, filtered.length)),
    { enabled: hasMore },
  );

  const statusChips = useMemo(() => ['', ...(meta?.statuses || ['Under Review', 'Planned', 'In Progress', 'Released'])], [meta]);

  function onFilterChange(setter) {
    return (val) => { setter(val); setVisibleCount(PAGE_SIZE); };
  }

  return (
    <>
      <SEO title="Feedback Center" description="Vote on ideas, report bugs, and help shape what ThinkEasy builds next." path="/feedback" />
      <Navbar active="feedback" />

      <div className="fbc-page">
        <motion.div className="fbc-hero" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1>Feedback Center</h1>
          <p>Vote on ideas, report bugs, and help shape what ThinkEasy builds next.</p>
        </motion.div>

        <div className="fbc-submit-cta">
          <div className="fbc-submit-cta-text">
            <strong>Got an idea or ran into a bug?</strong>
            <span>Your feedback goes straight into our roadmap.</span>
          </div>
          <Button variant="primary" icon="ti-message-plus" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Close' : 'Share Feedback'}
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fbc-form-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <FeedbackForm context={() => ({ id: null, name: null })} onSuccess={() => {}} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fbc-toolbar">
          <div className="fbc-search">
            <i className="ti ti-search" />
            <input
              type="text"
              placeholder="Search feedback by keyword, category…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
            />
          </div>
          <select className="fbc-sort-select" value={sort} onChange={(e) => onFilterChange(setSort)(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </div>

        <div className="fbc-filter-row">
          {statusChips.map((s) => (
            <button
              key={s || 'all'}
              type="button"
              className={`fbc-filter-chip${status === s ? ' active' : ''}`}
              onClick={() => onFilterChange(setStatus)(s)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="fbc-scope-note">
          <i className="ti ti-info-circle" />
          <span>Showing trending &amp; pinned feedback — the same set surfaced across ThinkEasy.</span>
        </div>

        {items === null && (
          <div className="fbc-grid"><CardGridSkeleton count={5} ItemSkeleton={FeedbackCardSkeleton} /></div>
        )}

        {items !== null && filtered.length === 0 && (
          <EmptyState icon="ti-mood-empty" title="No feedback found" sub="Try a different search term or filter, or be the first to share an idea." />
        )}

        {items !== null && filtered.length > 0 && (
          <div className="fbc-grid">
            <AnimatePresence initial={false}>
              {visible.map((item) => (
                <FeedbackCard
                  key={item.id}
                  item={item}
                  voted={votedIds.has(item.id)}
                  onVote={vote}
                  detail={cache[item.id]}
                  detailLoading={loadingId === item.id}
                  onExpand={fetchDetail}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {hasMore && <div ref={sentinelRef} className="fbc-sentinel" />}
      </div>

      <Footer />
      <FeedbackWidget context={() => ({ id: null, name: null })} />
    </>
  );
}
