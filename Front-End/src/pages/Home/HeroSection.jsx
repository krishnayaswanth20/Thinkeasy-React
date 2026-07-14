import { useEffect, useRef, useState } from 'react';
import * as api from '../../services/api';
import { Activity, trackVisit } from '../../utils/activity';
import { Watchlist } from '../../utils/watchlist';
import { escHtml } from '../../utils/format';

const SEARCH_MIN_CHARS = 2;
const SEARCH_DEBOUNCE_MS = 300;

function highlightMatch(text, q) {
  const str = String(text ?? '');
  if (!q) return str;
  const idx = str.toLowerCase().indexOf(String(q).toLowerCase());
  if (idx === -1) return str;
  return { before: str.slice(0, idx), match: str.slice(idx, idx + q.length), after: str.slice(idx + q.length) };
}

export default function HeroSection({ businesses, categories, onOpenBusiness, onGoToProduct, onAfterInteraction }) {
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [results, setResults] = useState([]); // flattened {type,...}
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const seqRef = useRef(0);
  const inputRef = useRef(null);

  const [welcome, setWelcome] = useState(null);
  const [dismissedWelcome, setDismissedWelcome] = useState(false);

  useEffect(() => {
    if (businesses.length === 0) return;
    const visit = trackVisit();
    if (!visit.isReturning) return;
    const savedCount = Watchlist.count();
    const viewedCount = Object.keys(Activity.getViews()).length;
    if (savedCount === 0 && viewedCount === 0) return;
    const topCategory = Activity.getTopCategories(businesses, 1)[0];
    let message;
    if (savedCount > 0 && viewedCount > 0) {
      message = `Welcome back 👋 You saved ${savedCount} business${savedCount === 1 ? '' : 'es'} and recently viewed ${viewedCount} opportunit${viewedCount === 1 ? 'y' : 'ies'}.`;
    } else if (savedCount > 0) {
      message = `Welcome back 👋 You have ${savedCount} saved business${savedCount === 1 ? '' : 'es'} waiting.`;
    } else if (topCategory) {
      message = `Welcome back 👋 Continue exploring ${topCategory} opportunities.`;
    } else {
      message = `Welcome back 👋 You've recently viewed ${viewedCount} opportunit${viewedCount === 1 ? 'y' : 'ies'}.`;
    }
    setWelcome({ message, savedCount, viewedCount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses.length]);

  function jump(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function runSearch(q) {
    const mySeq = ++seqRef.current;
    let data = { businesses: [], products: [] };
    try {
      data = await api.search(q);
    } catch { /* keep defaults */ }
    if (mySeq !== seqRef.current) return;
    const matchedCategories = categories.filter(
      (c) => c.name && c.name.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 5);
    const flattened = [
      ...matchedCategories.map((c) => ({ type: 'cat', ...c })),
      ...(data.businesses || []).map((b) => ({ type: 'biz', ...b })),
      ...(data.products || []).map((p) => ({ type: 'prod', ...p })),
    ];
    setResults(flattened);
    setActiveIndex(-1);
    setDropdownOpen(true);
  }

  function onInputChange(e) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (q.trim().length < SEARCH_MIN_CHARS) {
      setDropdownOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(q.trim()), SEARCH_DEBOUNCE_MS);
  }

  function metaLine(row) {
    if (row.type === 'cat') return 'Category';
    return [row.category, row.investment, row.growth_rate, row.market_size].filter(Boolean).join(' • ');
  }

  function iconFor(type) {
    return type === 'cat' ? 'ti-category' : type === 'biz' ? 'ti-building-store' : 'ti-package';
  }

  function selectResult(row) {
    setQuery(row.name);
    setDropdownOpen(false);
    if (row.type === 'cat') {
      jump('roi');
      return;
    }
    Activity.recordSearchClick(row.id);
    if (row.type === 'biz') onOpenBusiness(row.id, true);
    else onGoToProduct(row.id);
    onAfterInteraction?.();
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!dropdownOpen) return;
      if (!results.length) return;
      setActiveIndex((i) => (i + 1) % results.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!dropdownOpen || !results.length) return;
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) selectResult(results[activeIndex]);
      else if (results.length) selectResult(results[0]);
      return;
    }
    if (e.key === 'Escape') setDropdownOpen(false);
  }

  // Popular searches
  const popularChips = (() => {
    if (businesses.length === 0) return [];
    const scored = businesses.map((biz) => {
      const engagement = Activity.getEngagement(biz.id);
      const popularity = engagement * 4 + (biz.trendScore || 0) * 0.6;
      return { biz, popularity };
    }).sort((a, b) => b.popularity - a.popularity);
    const seen = new Set();
    const chips = [];
    for (const { biz } of scored) {
      const key = biz.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      chips.push(biz);
      if (chips.length >= 8) break;
    }
    if (chips.length < Math.min(3, businesses.length)) return [];
    return chips;
  })();

  // Hero stats
  const count = businesses.length;
  let badgeText = 'Real business opportunities, ranked live';
  let statBiz = '—', statInd = '—', statAvgG = '—', statTopG = '—';
  if (count > 0) {
    const industries = new Set(businesses.map((b) => b.category).filter(Boolean)).size;
    const growthRates = businesses.map((b) => parseFloat(String(b.growthRate).replace(/[^0-9.-]/g, ''))).filter((n) => !isNaN(n));
    const avgGrowth = growthRates.length ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length : null;
    const topGrowth = growthRates.length ? Math.max(...growthRates) : null;
    badgeText = `${count} business opportunit${count === 1 ? 'y' : 'ies'} analyzed — and growing`;
    statBiz = String(count);
    statInd = String(industries);
    statAvgG = avgGrowth != null ? `+${avgGrowth.toFixed(1)}%` : '—';
    statTopG = topGrowth != null ? `+${topGrowth.toFixed(0)}%` : '—';
  }

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-badge">
          <span className="badge-dot" />
          <span>{count === 0 ? 'Loading real business data…' : badgeText}</span>
        </div>

        {welcome && !dismissedWelcome && (
          <div className="welcome-back-banner">
            <span dangerouslySetInnerHTML={{ __html: escHtml(welcome.message) }} />
            <div className="welcome-back-actions">
              {welcome.savedCount > 0 && <button className="welcome-back-btn" onClick={() => jump('savedSection')}>View Saved</button>}
              {welcome.viewedCount > 0 && <button className="welcome-back-btn" onClick={() => jump('recentSection')}>Continue Exploring</button>}
            </div>
            <button className="welcome-back-dismiss" aria-label="Dismiss" onClick={() => setDismissedWelcome(true)}>
              <i className="ti ti-x" />
            </button>
          </div>
        )}

        <h1 className="hero-headline">
          Discover Profitable Businesses<br />
          <span className="headline-gradient">Before Everyone Else</span>
        </h1>

        <p className="hero-sub">
          Analyze market size, investment, competition, suppliers and<br className="hide-mobile" /> growth opportunities — all in one place.
        </p>

        <div className="search-wrap">
          <div className="search-box">
            <i className="ti ti-search search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search categories, businesses, or products..."
              autoComplete="off"
              value={query}
              onChange={onInputChange}
              onFocus={() => { if (query.trim().length >= SEARCH_MIN_CHARS) setDropdownOpen(true); }}
              onKeyDown={onKeyDown}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            />
            <button className="search-btn" onClick={() => { if (results.length) selectResult(results[0]); else inputRef.current?.focus(); }}>Search</button>
          </div>
          <div className={`search-dropdown${dropdownOpen ? ' visible' : ''}`}>
            <div className="dropdown-header">
              <i className="ti ti-trending-up" />
              <span>{results.length > 0 ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"` : (query.trim().length >= SEARCH_MIN_CHARS ? 'No matches found' : 'Top Results')}</span>
            </div>
            <div className="dropdown-results">
              {results.length === 0 && query.trim().length >= SEARCH_MIN_CHARS && (
                <div className="dd-empty"><i className="ti ti-search-off" /><span>No results found — try a different keyword</span></div>
              )}
              {(() => {
                let lastSection = null;
                const labels = { cat: 'Categories', biz: 'Businesses', prod: 'Products' };
                return results.map((row, idx) => {
                  const showLabel = row.type !== lastSection;
                  lastSection = row.type;
                  const hl = highlightMatch(row.name, query);
                  return (
                    <div key={`${row.type}-${row.id}-${idx}`}>
                      {showLabel && <div className="dd-section-label">{labels[row.type]}</div>}
                      <div
                        className={`dd-result dd-${row.type}${activeIndex === idx ? ' active' : ''}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => { e.preventDefault(); selectResult(row); }}
                      >
                        <i className={`ti ${iconFor(row.type)} dd-type-icon`} />
                        <span>{typeof hl === 'string' ? hl : <>{hl.before}<mark>{hl.match}</mark>{hl.after}</>}</span>
                        <span className="dd-meta">{metaLine(row)}</span>
                        <i className="ti ti-arrow-right dd-go" />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {popularChips.length > 0 && (
          <div className="pills-row">
            <span className="pills-label">Popular:</span>
            {popularChips.map((biz) => (
              <div key={biz.id} className="pill" onClick={() => { setQuery(biz.name); Activity.recordSearchClick(biz.id); onOpenBusiness(biz.id, true); onAfterInteraction?.(); }}>
                {biz.name}
              </div>
            ))}
          </div>
        )}

        <button className="scroll-cue" aria-label="Scroll to explore Think Easy" onClick={() => document.getElementById('heroStats')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          <span className="scroll-cue-label">Explore the platform</span>
          <i className="ti ti-chevron-down scroll-cue-arrow" />
        </button>
      </section>

      <section className="stats-strip reveal is-visible" id="heroStats">
        <div className="section-inner">
          <div className="hero-stats">
            <div className="stat-item"><span className="stat-num">{statBiz}</span><span className="stat-label">Businesses Tracked</span></div>
            <div className="stat-divider" />
            <div className="stat-item"><span className="stat-num">{statInd}</span><span className="stat-label">Industries Covered</span></div>
            <div className="stat-divider" />
            <div className="stat-item"><span className="stat-num">{statAvgG}</span><span className="stat-label">Avg. Growth Rate</span></div>
            <div className="stat-divider" />
            <div className="stat-item"><span className="stat-num">{statTopG}</span><span className="stat-label">Highest Growth Found</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
