import { useMemo, useState } from 'react';
import TrendingCard from '../../components/Cards/TrendingCard';

export default function TrendingSection({ businesses, onOpen, onBookmarkToggle, onCompareToggle, onCompareBlocked }) {
  const [activeCategory, setActiveCategory] = useState('');

  const pool = useMemo(
    () => [...businesses].filter((b) => b.name).sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0)).slice(0, 14),
    [businesses],
  );

  const topCats = useMemo(() => {
    const counts = {};
    pool.forEach((b) => { if (b.category) counts[b.category] = (counts[b.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map((e) => e[0]);
  }, [pool]);

  const filtered = activeCategory ? pool.filter((b) => b.category === activeCategory) : pool;
  const featured = filtered.slice(0, 4);

  return (
    <section className="trending-section reveal is-visible" id="trending">
      <div className="section-inner">
        <div className="section-eyebrow center">What's Hot Right Now</div>
        <h2 className="section-title center">Trending Opportunities</h2>
        <p className="section-sub center">The 4 businesses gaining the most traction right now — ranked live from real engagement data.</p>

        <div className="smart-filter-row">
          <span className="smart-filter-label">Filter:</span>
          <button className={`filter-chip${activeCategory === '' ? ' active' : ''}`} onClick={() => setActiveCategory('')}>All</button>
          {topCats.map((cat) => (
            <button key={cat} className={`filter-chip${activeCategory === cat ? ' active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>

        <div className="trending-grid">
          {featured.length === 0 && (
            <div className="empty-state"><i className="ti ti-mood-empty" /><span>No businesses found for this filter yet.</span></div>
          )}
          {featured.map((biz, i) => (
            <TrendingCard
              key={biz.id}
              biz={biz}
              index={i}
              set={featured}
              onOpen={onOpen}
              onBookmarkToggle={onBookmarkToggle}
              onCompareToggle={onCompareToggle}
              onCompareBlocked={onCompareBlocked}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
