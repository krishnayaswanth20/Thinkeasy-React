import { memo } from 'react';
import { tagClassFor, formatGrowth } from '../../utils/format';
import { BookmarkButton, CompareButton } from './CardActions';

function RecCard({ biz, reason, reasonIcon = 'ti-sparkles', onOpen, onBookmarkToggle, onCompareToggle, onCompareBlocked }) {
  const tagCls = tagClassFor(biz.category);
  return (
    <div className="rec-card" onClick={() => onOpen(biz.id)}>
      <div className="rec-card-top">
        <span className="rec-reason"><i className={`ti ${reasonIcon}`} /> {reason}</span>
        <div className="rec-card-actions">
          <CompareButton id={biz.id} onToggle={onCompareToggle} onBlocked={onCompareBlocked} />
          <BookmarkButton id={biz.id} onToggle={onBookmarkToggle} />
        </div>
      </div>
      <span className="rec-name">{biz.name}</span>
      <span className="rec-tags"><span className={`tag ${tagCls}`}>{biz.category || 'General'}</span></span>
      <div className="rec-meta-row"><span>Growth</span><span>{formatGrowth(biz.growthRate)}</span></div>
      <div className="rec-meta-row"><span>Investment</span><span>{biz.investment || '—'}</span></div>
      <div className="rec-cta">View Details <i className="ti ti-arrow-right" /></div>
    </div>
  );
}

export default memo(RecCard);
