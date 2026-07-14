import { memo } from 'react';
import { tagClassFor, formatGrowth, formatPercent } from '../../utils/format';
import { BookmarkButton, CompareButton } from './CardActions';

function ROICard({ b, maxScore, onOpen, onBookmarkToggle, onCompareToggle, onCompareBlocked }) {
  const tagCls = tagClassFor(b.category);
  const barPct = Math.max(8, Math.round(((b.roiScore || 0) / maxScore) * 100));
  const scoreOutOf100 = Math.max(1, Math.min(100, Math.round((b.roiScore || 0) * 100)));

  return (
    <div className="roi-card" onClick={() => onOpen(b.id)}>
      <div className="roi-card-head">
        <span className="roi-tag"><i className="ti ti-bolt" /> High ROI</span>
        <div className="roi-card-actions">
          <CompareButton id={b.id} onToggle={onCompareToggle} onBlocked={onCompareBlocked} />
          <BookmarkButton id={b.id} onToggle={onBookmarkToggle} />
          <span className="roi-score"><span className="roi-score-num">{scoreOutOf100}</span><span className="roi-score-label">ROI Score</span></span>
        </div>
      </div>
      <span className="roi-name">{b.name}</span>
      <span className="biz-tags"><span className={`tag ${tagCls}`}>{b.category || 'General'}</span></span>
      <div className="roi-meta-row"><span>Growth</span><span>{formatGrowth(b.growthRate)}</span></div>
      <div className="roi-meta-row"><span>Profit Potential</span><span>{formatPercent(b.profitMargin)}</span></div>
      <div className="roi-meta-row"><span>Market Size</span><span>{b.marketSize || '—'}</span></div>
      <span className="roi-bar-label">Investment Efficiency</span>
      <div className="roi-bar-track"><div className="roi-bar-fill" style={{ width: `${barPct}%` }} /></div>
    </div>
  );
}

export default memo(ROICard);
