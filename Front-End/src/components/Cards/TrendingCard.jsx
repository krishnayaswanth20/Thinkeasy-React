import { memo } from 'react';
import { tagClassFor, investLevelLabel, formatGrowth } from '../../utils/format';
import { parseNumeric } from '../../utils/format';
import { Activity } from '../../utils/activity';
import { BookmarkButton, CompareButton } from './CardActions';

// Assigns ONE signal badge per card — never stacked, never repeated within
// the same set. Ported 1:1 from legacy pickTrendBadge().
function pickTrendBadge(biz, index, set) {
  if (index === 0) return { icon: 'ti-flame', label: 'Trending #1' };
  const rest = set.filter((_, i) => i !== 0);
  const maxGrowth = Math.max(...rest.map((b) => parseNumeric(b.growthRate) || -Infinity));
  if (parseNumeric(biz.growthRate) === maxGrowth && maxGrowth > -Infinity) {
    return { icon: 'ti-rocket', label: 'Growing Fast' };
  }
  const eng = Activity.getEngagement(biz.id);
  if (eng > 0) return { icon: 'ti-star', label: 'Most Viewed' };
  return { icon: 'ti-sparkles', label: 'New Opportunity' };
}

function TrendingCard({ biz, index, set, onOpen, onBookmarkToggle, onCompareToggle, onCompareBlocked }) {
  const rank = String(index + 1).padStart(2, '0');
  const tagCls = tagClassFor(biz.category);
  const badge = pickTrendBadge(biz, index, set);
  const invest = investLevelLabel(biz.investmentTier);

  return (
    <div className="biz-card" onClick={() => onOpen(biz.id)}>
      <div className="biz-card-left">
        <div className="biz-rank">{rank}</div>
        <div className="biz-info">
          <span className="biz-name">{biz.name}</span>
          <span className="biz-tags">
            <span className={`tag ${tagCls}`}>{biz.category || 'General'}</span>
            <span className="tag tag-trend"><i className={`ti ${badge.icon}`} /> {badge.label}</span>
            {invest && <span className={`tag ${invest.cls}`}>{invest.label}</span>}
          </span>
        </div>
        <div className="biz-card-actions">
          <CompareButton id={biz.id} onToggle={onCompareToggle} onBlocked={onCompareBlocked} />
          <BookmarkButton id={biz.id} onToggle={onBookmarkToggle} />
        </div>
      </div>
      <div className="biz-card-right">
        <div className="biz-meta"><span className="meta-label">Investment Range</span><span className="meta-val">{biz.investment || '—'}</span></div>
        <div className="biz-meta"><span className="meta-label">Market Size</span><span className="meta-val">{biz.marketSize || '—'}</span></div>
        <div className="biz-meta"><span className="meta-label">Growth</span><span className="meta-val growth-pos"><i className="ti ti-trending-up" /> {formatGrowth(biz.growthRate)}</span></div>
      </div>
      <div className="biz-card-cta">View Details <i className="ti ti-arrow-right" /></div>
    </div>
  );
}

export { formatGrowth };

export default memo(TrendingCard);
