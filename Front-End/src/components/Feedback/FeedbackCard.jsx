import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import StatusTimeline from './StatusTimeline';
import { timeAgoShort } from '../../utils/feedbackShared';
import { renderMarkdownLite } from '../../utils/markdownLite';

function FeedbackCard({ item, voted, onVote, detail, detailLoading, onExpand }) {
  const [expanded, setExpanded] = useState(false);

  function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !detail) onExpand(item.id);
  }

  return (
    <motion.div
      layout
      className={`fbc-card${item.is_pinned ? ' pinned' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      onClick={toggleExpand}
    >
      <div className="fbc-vote-col">
        <button
          type="button"
          className={`fbc-vote-btn${voted ? ' voted' : ''}`}
          onClick={(e) => { e.stopPropagation(); onVote(item.id); }}
          aria-label={voted ? 'Remove vote' : 'Vote for this'}
        >
          <span className="arrow">▲</span>
          <span className="vcount">{item.vote_count}</span>
        </button>
      </div>
      <div className="fbc-body">
        <div className="fbc-top-row">
          <span className="fbc-cat-badge">{item.category}</span>
          {item.is_pinned ? <span className="fbc-pin-badge">📌</span> : null}
          <StatusBadge status={item.status} />
        </div>
        <div className="fbc-subject">{item.subject}</div>
        <div className="fbc-message">{renderMarkdownLite(item.message)}</div>
        <div className="fbc-meta-row">
          {item.business_name && <span>📍 {item.business_name}</span>}
          <span>{timeAgoShort(item.created_at)}</span>
          <span className="fbc-expand-hint">{expanded ? 'Hide details ▲' : 'View details ▼'}</span>
        </div>

        {expanded && (
          <motion.div
            className="fbc-detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {detailLoading ? (
              <div className="fbc-detail-loading">Loading admin response…</div>
            ) : detail ? (
              <>
                <StatusTimeline item={detail} />
                {detail.admin_response ? (
                  <div className="fbc-admin-reply">
                    <div className="fbc-admin-reply-head"><i className="ti ti-shield-check" /> Team Response</div>
                    <div className="fbc-admin-reply-body">{renderMarkdownLite(detail.admin_response)}</div>
                  </div>
                ) : (
                  <div className="fbc-detail-loading">No team response yet — vote to help this get prioritized.</div>
                )}
              </>
            ) : (
              <div className="fbc-detail-loading">No team response yet — vote to help this get prioritized.</div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(FeedbackCard);
