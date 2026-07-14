import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseNumeric } from '../../utils/format';
import ROICard from '../../components/Cards/ROICard';
import { tagClassFor } from '../../utils/format';

export function InsightsSection({ businesses }) {
  const cards = useMemo(() => {
    if (businesses.length === 0) return null;
    const byGrowth = [...businesses].sort((a, b) => (parseNumeric(b.growthRate) || -Infinity) - (parseNumeric(a.growthRate) || -Infinity));
    const topGrowth = byGrowth[0];
    const byROI = [...businesses].sort((a, b) => (b.roiScore || 0) - (a.roiScore || 0));
    const topROI = byROI[0];
    const byMarket = [...businesses].sort((a, b) => (parseNumeric(b.marketSize) || -Infinity) - (parseNumeric(a.marketSize) || -Infinity));
    const topMarket = byMarket[0];
    const withInvestment = businesses.filter((b) => !isNaN(parseNumeric(b.investment)));
    const byLowInvestment = [...withInvestment].sort((a, b) => parseNumeric(a.investment) - parseNumeric(b.investment));
    const lowestInvestment = byLowInvestment[0];
    return [
      { icon: '📈', label: 'Highest Growth Industry', value: topGrowth ? (topGrowth.category || topGrowth.name) : '—' },
      { icon: '⚡', label: 'Fastest ROI', value: topROI ? topROI.name : '—', sub: topROI?.investment ? `From ${topROI.investment}` : '' },
      { icon: '🏦', label: 'Highest Market Size', value: topMarket ? (topMarket.marketSize || '—') : '—', sub: topMarket?.name },
      { icon: '💰', label: 'Lowest Investment', value: lowestInvestment ? (lowestInvestment.investment || '—') : '—', sub: lowestInvestment?.name },
    ];
  }, [businesses]);

  return (
    <section className="insights-section reveal is-visible" id="insights">
      <div className="section-inner">
        <div className="section-eyebrow center">At a Glance</div>
        <h2 className="section-title center">Featured Insights</h2>
        <div className="kpi-grid">
          {!cards && [0, 1, 2, 3].map((i) => (
            <div key={i} className="kpi-card" style={{ opacity: 0.4, pointerEvents: 'none' }}>
              <span className="kpi-icon">⏳</span><span className="kpi-label">Loading…</span><span className="kpi-value">—</span>
            </div>
          ))}
          {cards && cards.map((c) => (
            <div key={c.label} className="kpi-card">
              <span className="kpi-icon">{c.icon}</span>
              <span className="kpi-label">{c.label}</span>
              <span className="kpi-value">{String(c.value)}</span>
              {c.sub && <span className="kpi-sub">{c.sub}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ROISection({ businesses, onOpen, onBookmarkToggle, onCompareToggle, onCompareBlocked }) {
  const ranked = useMemo(
    () => [...businesses].sort((a, b) => (b.roiScore || 0) - (a.roiScore || 0)).slice(0, 4),
    [businesses],
  );
  const maxScore = Math.max(...ranked.map((b) => b.roiScore || 0), 0.01);

  return (
    <section className="roi-section reveal is-visible" id="roi">
      <a id="businesses" className="visually-hidden" aria-hidden="true" tabIndex={-1} />
      <div className="section-inner">
        <div className="section-eyebrow center">Best Returns</div>
        <h2 className="section-title center">High ROI Opportunities</h2>
        <p className="section-sub center">Auto-ranked by margin, growth rate and market size — never manually curated.</p>
        <div className="roi-grid">
          {businesses.length === 0 && (
            <div className="empty-state"><i className="ti ti-mood-empty" /><span>No business data available yet.</span></div>
          )}
          {ranked.map((b) => (
            <ROICard
              key={b.id}
              b={b}
              maxScore={maxScore}
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

export function ProductsSection({ products }) {
  const navigate = useNavigate();
  const shown = products.slice(0, 8);
  return (
    <section className="products-section reveal is-visible" id="products">
      <div className="section-inner">
        <div className="section-eyebrow center">Ready-Made Products</div>
        <h2 className="section-title center">Products</h2>
        <p className="section-sub center">Specific products backed by real market and investment data.</p>
        <div className="roi-grid">
          {products.length === 0 && (
            <div className="empty-state"><i className="ti ti-mood-empty" /><span>No products available yet.</span></div>
          )}
          {shown.map((p) => (
            <div key={p.id} className="roi-card" onClick={() => navigate(`/product/${p.id}`)}>
              <div className="roi-card-head">
                <span className="roi-tag"><i className="ti ti-package" /> Product</span>
              </div>
              <span className="roi-name">{p.name}</span>
              <span className="biz-tags"><span className={`tag ${tagClassFor(p.category)}`}>{p.category || 'General'}</span></span>
              {p.businessName && (
                <div className="roi-meta-row"><span>Parent Business</span><span>{p.businessName}</span></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GrowthSection({ businesses }) {
  const industries = useMemo(() => {
    if (businesses.length === 0) return { list: [], overallMean: 0 };
    const groups = {};
    businesses.forEach((b) => {
      const cat = b.category || 'General';
      if (!groups[cat]) groups[cat] = { rates: [], count: 0 };
      groups[cat].count += 1;
      const g = parseNumeric(b.growthRate);
      if (!isNaN(g)) groups[cat].rates.push(g);
    });
    const allRates = Object.values(groups).flatMap((v) => v.rates);
    const overallMean = allRates.length ? allRates.reduce((a, b) => a + b, 0) / allRates.length : 0;
    const list = Object.entries(groups)
      .filter(([, v]) => v.rates.length > 0)
      .map(([name, v]) => ({ name, avg: v.rates.reduce((a, b) => a + b, 0) / v.rates.length, count: v.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
    return { list, overallMean };
  }, [businesses]);

  const maxAvg = Math.max(...industries.list.map((i) => i.avg), 1);

  return (
    <section className="growth-section reveal is-visible" id="growth">
      <div className="section-inner">
        <div className="section-eyebrow center">Momentum</div>
        <h2 className="section-title center">Fastest Growing Industries</h2>
        <p className="section-sub center">The top industries by average growth rate, and how many live opportunities each has.</p>
        <div className="growth-grid">
          {industries.list.length === 0 && (
            <div className="empty-state"><i className="ti ti-mood-empty" /><span>No growth data available yet.</span></div>
          )}
          {industries.list.map((ind, i) => {
            const barPct = Math.max(8, Math.round((ind.avg / maxAvg) * 100));
            const rising = ind.avg >= industries.overallMean;
            return (
              <div key={ind.name} className={`growth-card${i === 0 ? ' growth-card--leader' : ''}`}>
                <div className="growth-card-top">
                  <span className="growth-name">{i === 0 && <i className="ti ti-crown growth-crown" />} {ind.name}</span>
                  <span className="growth-pct-chip">+{ind.avg.toFixed(1)}%</span>
                </div>
                <div className="growth-bar-track"><div className="growth-bar-fill" style={{ width: `${barPct}%` }} /></div>
                <span className="growth-count"><strong>{ind.count}</strong> opportunit{ind.count === 1 ? 'y' : 'ies'}</span>
                {rising
                  ? <span className="growth-trend up"><i className="ti ti-trending-up" /> Rising</span>
                  : <span className="growth-trend steady"><i className="ti ti-arrow-right" /> Steady</span>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
