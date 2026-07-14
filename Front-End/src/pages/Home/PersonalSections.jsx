import { useMemo } from 'react';
import { Activity } from '../../utils/activity';
import { Watchlist } from '../../utils/watchlist';
import { parseNumeric, timeAgo } from '../../utils/format';
import RecCard from '../../components/Cards/RecCard';

export function DashboardSection({ businesses, refreshTick }) {
  const savedCount = Watchlist.count();
  const views = Activity.getViews();
  const viewedCount = Object.keys(views).length;
  const topInterest = Activity.getTopCategories(businesses, 1)[0] || null;

  const mostViewedIndustry = useMemo(() => {
    const counts = {};
    Object.entries(views).forEach(([id, entry]) => {
      const biz = businesses.find((b) => String(b.id) === id);
      if (!biz || !biz.category) return;
      counts[biz.category] = (counts[biz.category] || 0) + entry.count;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses, refreshTick]);

  function jump(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  const cards = [
    { icon: 'ti-bookmark-filled', label: 'Saved Businesses', value: String(savedCount), sub: savedCount > 0 ? 'In your Watchlist' : 'Tap the bookmark icon to save one', jump: 'savedSection' },
    { icon: 'ti-history', label: 'Recently Viewed', value: String(viewedCount), sub: viewedCount > 0 ? 'Opportunities explored' : 'Open a business to start', jump: 'recentSection' },
    { icon: 'ti-target-arrow', label: 'Top Interest Category', value: topInterest || '—', sub: topInterest ? 'Based on your activity' : 'Explore to see your interests', jump: 'recommended' },
    { icon: 'ti-chart-bar', label: 'Most Viewed Industry', value: mostViewedIndustry || '—', sub: mostViewedIndustry ? 'By view count' : 'No views yet', jump: 'growth' },
  ];

  return (
    <section className="dashboard-section reveal is-visible" id="dashboardSection">
      <div className="section-inner">
        <div className="section-eyebrow center">Your Activity</div>
        <h2 className="section-title center">Your Dashboard</h2>
        <p className="section-sub center">A quick snapshot of what you've saved and explored so far.</p>
        <div className="dash-grid">
          {cards.map((c) => (
            <div key={c.label} className="dash-card" onClick={() => jump(c.jump)}>
              <span className="dash-icon"><i className={`ti ${c.icon}`} /></span>
              <span className="dash-value">{c.value}</span>
              <span className="dash-label">{c.label}</span>
              <span className="dash-sub">{c.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecentlyViewedSection({ businesses, onOpen, refreshTick }) {
  const entries = useMemo(() => {
    const views = Activity.getViews();
    return Object.entries(views)
      .map(([id, entry]) => ({ biz: businesses.find((b) => String(b.id) === id), ...entry }))
      .filter((e) => e.biz)
      .sort((a, b) => b.last - a.last)
      .slice(0, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses, refreshTick]);

  if (entries.length === 0) return null;

  return (
    <section className="recent-section reveal is-visible" id="recentSection">
      <div className="section-inner">
        <div className="section-eyebrow center">Pick Up Where You Left Off</div>
        <h2 className="section-title center">Recently Viewed</h2>
        <div className="recent-grid">
          {entries.map(({ biz, last }) => (
            <div key={biz.id} className="recent-card" onClick={() => onOpen(biz.id)}>
              <span className="recent-icon"><i className="ti ti-history" /></span>
              <div className="recent-info">
                <span className="recent-name">{biz.name}</span>
                <span className="recent-meta">{biz.category || 'General'} · {timeAgo(last)}</span>
              </div>
              <i className="ti ti-arrow-right recent-arrow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecommendedSection({ businesses, trendingPool, onOpen, onBookmarkToggle, onCompareToggle, onCompareBlocked }) {
  const { picks, personalized } = useMemo(() => {
    if (businesses.length === 0) return { picks: [], personalized: false };
    const trendingIds = new Set(trendingPool.slice(0, 4).map((b) => String(b.id)));
    const preferredCats = Activity.getTopCategories(businesses, 2);
    const byTrend = (a, b) => (b.trendScore || 0) - (a.trendScore || 0);
    const rates = businesses.map((b) => parseNumeric(b.growthRate)).filter((n) => !isNaN(n));
    const overallGrowthMean = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

    const list = [];
    const usedIds = new Set();

    if (preferredCats.length > 0) {
      businesses
        .filter((b) => preferredCats.includes(b.category) && !trendingIds.has(String(b.id)))
        .sort(byTrend)
        .forEach((b) => {
          if (list.length < 4 && !usedIds.has(b.id)) {
            const reason = list.length === 0 && Activity.hasViewedCategory(businesses, b.category)
              ? `Because you viewed ${b.category}`
              : 'Similar to businesses you explored';
            list.push({ biz: b, reason });
            usedIds.add(b.id);
          }
        });
    }
    if (list.length < 4) {
      [...businesses]
        .filter((b) => !trendingIds.has(String(b.id)) && !usedIds.has(b.id))
        .sort(byTrend)
        .forEach((b) => {
          if (list.length < 4) {
            const g = parseNumeric(b.growthRate);
            const reason = !isNaN(g) && g > overallGrowthMean ? 'High-growth opportunity' : 'Trending among entrepreneurs';
            list.push({ biz: b, reason });
            usedIds.add(b.id);
          }
        });
    }
    return { picks: list, personalized: preferredCats.length > 0 };
  }, [businesses, trendingPool]);

  const title = personalized ? 'Recommended For You' : 'Recommended Opportunities';
  const sub = personalized ? "Picked based on the categories you've been exploring." : 'Popular picks other founders are exploring right now.';

  return (
    <section className="recommended-section reveal is-visible" id="recommended">
      <div className="section-inner">
        <div className="section-eyebrow center">Just For You</div>
        <h2 className="section-title center">{title}</h2>
        <p className="section-sub center">{sub}</p>
        <div className="rec-grid">
          {picks.length === 0 && (
            <div className="empty-state"><i className="ti ti-mood-empty" /><span>No recommendations available yet.</span></div>
          )}
          {picks.map(({ biz, reason }) => (
            <RecCard
              key={biz.id}
              biz={biz}
              reason={reason}
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

export function SavedSection({ businesses, onOpen, onBookmarkToggle, onCompareToggle, onCompareBlocked, refreshTick }) {
  const items = useMemo(() => {
    const ids = Watchlist.getIds();
    return ids.map((id) => businesses.find((b) => String(b.id) === id)).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses, refreshTick]);

  if (items.length === 0) return null;

  return (
    <section className="saved-section reveal is-visible" id="savedSection">
      <div className="section-inner">
        <div className="section-eyebrow center">Your Watchlist</div>
        <h2 className="section-title center">Saved for You<span className="section-title-count"> ({items.length})</span></h2>
        <p className="section-sub center">Opportunities you've bookmarked — saved right here in this browser.</p>
        <div className="rec-grid">
          {items.map((biz) => (
            <RecCard
              key={biz.id}
              biz={biz}
              reason="Saved by you"
              reasonIcon="ti-bookmark-filled"
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
