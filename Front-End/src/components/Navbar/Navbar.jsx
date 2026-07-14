import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import * as api from '../../services/api';
import { RecentSearches } from '../../utils/recentSearches';
import { useSearchData } from '../../hooks/useSearchData';
import { highlightMatch } from '../../utils/format';
import SearchResultSkeleton from './SearchResultSkeleton';
import MegaMenu from './MegaMenu';
import NotificationBell from '../Notifications/NotificationBell';
// Navbar styles live in the global src/styles/design-system.css
// (imported once in main.jsx), plus src/styles/navbar-upgrade.css for
// the mega menu / floating search bar additions below.

const NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'trending', label: 'Trending', href: '/#trending' },
  { key: 'feedback', label: 'Feedback', href: '/feedback' },
];

const SEARCH_MIN_CHARS = 2;

function HighlightedText({ text, query }) {
  const hl = highlightMatch(text, query);
  if (typeof hl === 'string') return hl;
  return <>{hl.before}<mark>{hl.match}</mark>{hl.after}</>;
}

export default function Navbar({ active = 'home', showBack = false, authArea = null }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('te-theme') || null);
  const [scrolled, setScrolled] = useState(false);
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ businesses: [], products: [] });
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState([]);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const searchData = useSearchData();

  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 4);
      setShowFloatingSearch(window.scrollY > 250);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function onKeydown(e) {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openSearch();
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  function toggleTheme() {
    const cur = theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('te-theme', next);
  }

  function openSearch() {
    setSearchOpen(true);
    setQuery('');
    setActiveIndex(-1);
    setResults({ businesses: [], products: [] });
    setRecent(RecentSearches.getAll());
    searchData.ensureLoaded(); // warms the trending cache too
    setTimeout(() => inputRef.current?.focus(), 30);
  }

  function onQueryChange(e) {
    const q = e.target.value;
    setQuery(q);
    setActiveIndex(-1);
    clearTimeout(debounceRef.current);
    if (q.trim().length < SEARCH_MIN_CHARS) {
      setResults({ businesses: [], products: [] });
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(q.trim()), 220);
  }

  async function runSearch(q) {
    setSearching(true);
    try {
      const res = await api.search(q);
      // Businesses and Products only — categories are deliberately never
      // shown in this search per the Crunchbase-style search spec.
      setResults({ businesses: res.businesses || [], products: res.products || [] });
    } catch {
      setResults({ businesses: [], products: [] });
    } finally {
      setSearching(false);
    }
  }

  const flatResults = [
    ...results.businesses.map((b) => ({ type: 'business', ...b })),
    ...results.products.map((p) => ({ type: 'product', ...p })),
  ];
  const hasResults = flatResults.length > 0;
  const showingIdle = query.trim().length < SEARCH_MIN_CHARS;

  function selectResult(row) {
    RecentSearches.add({ type: row.type, id: row.id, name: row.name });
    setSearchOpen(false);
    navigate(row.type === 'business' ? `/business/${row.id}` : `/product/${row.id}`);
  }

  function selectRecent(entry) {
    setSearchOpen(false);
    navigate(entry.type === 'business' ? `/business/${entry.id}` : `/product/${entry.id}`);
  }

  function onKeyDown(e) {
    if (showingIdle) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatResults.length) setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatResults.length) setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const row = flatResults[activeIndex] ?? flatResults[0];
      if (row) selectResult(row);
    }
  }

  const trending = searchData.getTrending(6);

  return (
    <>
      <nav className={`te-navbar${scrolled ? ' is-scrolled' : ''}`}>
        <Link className="te-nav-logo" to="/">
          <div className="te-nav-logo-mark">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <span className="te-nav-logo-text">Think<span className="accent">Easy</span></span>
        </Link>

        {showBack && (
          <button className="te-nav-back" type="button" onClick={() => navigate(-1)}>
            <i className="ti ti-chevron-left" /><span>Back</span>
          </button>
        )}

        <div className="te-nav-links" onMouseLeave={() => setMegaOpen(false)}>
          <div
            className={`te-nav-explore${megaOpen ? ' active' : ''}`}
            onMouseEnter={() => { searchData.ensureLoaded(); setMegaOpen(true); }}
            onClick={() => { searchData.ensureLoaded(); setMegaOpen((v) => !v); }}
          >
            Explore <i className="ti ti-chevron-down" style={{ fontSize: 13 }} />
          </div>
          {NAV_ITEMS.map((item) => (
            <a key={item.key} href={item.href} className={active === item.key ? 'active' : ''}>
              {item.label}
            </a>
          ))}
        </div>

        <button className="te-nav-search" type="button" aria-label="Search" onClick={openSearch}>
          <i className="ti ti-search" /><span>Search businesses, products...</span><kbd>/</kbd>
        </button>

        <div className="te-nav-actions">
          {authArea}
          <NotificationBell />
          <button className="te-theme-toggle" type="button" aria-label="Toggle dark mode" onClick={toggleTheme}>
            <i className="ti ti-sun icon-sun" /><i className="ti ti-moon icon-moon" />
          </button>
          <button
            className="te-nav-hamburger"
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>

        <AnimatePresence>
          {megaOpen && <MegaMenu searchData={searchData} onClose={() => setMegaOpen(false)} />}
        </AnimatePresence>
      </nav>

      {/* Floating sticky search bar — appears after 250px of scroll,
          opens the exact same search overlay as the nav search button. */}
      <AnimatePresence>
        {showFloatingSearch && !searchOpen && (
          <motion.button
            type="button"
            className="te-floating-search"
            aria-label="Search"
            onClick={openSearch}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <i className="ti ti-search" /><span>Search businesses, products...</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="te-mobile-menu open"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {NAV_ITEMS.map((item) => (
              <a key={item.key} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="te-search-overlay open"
            onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="te-search-modal"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            >
              <div className="te-search-input-row">
                <i className="ti ti-search" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search businesses or products..."
                  autoComplete="off"
                  value={query}
                  onChange={onQueryChange}
                  onKeyDown={onKeyDown}
                />
                <span className="te-search-esc">ESC</span>
              </div>
              <div className="te-search-results">
                {showingIdle && (
                  <>
                    {recent.length > 0 && (
                      <>
                        <div className="te-search-group-label">
                          Recent Searches
                          <button type="button" className="te-search-clear" onClick={() => { RecentSearches.clear(); setRecent([]); }}>Clear</button>
                        </div>
                        {recent.map((r) => (
                          <a key={`${r.type}-${r.id}`} className="te-search-item" onClick={() => selectRecent(r)}>
                            <div className="te-search-item-icon"><i className="ti ti-clock" /></div>
                            <div>
                              <div className="te-search-item-name">{r.name}</div>
                              <div className="te-search-item-meta">{r.type === 'business' ? 'Business' : 'Product'}</div>
                            </div>
                          </a>
                        ))}
                      </>
                    )}
                    {trending.length > 0 && (
                      <>
                        <div className="te-search-group-label">Trending Now</div>
                        {trending.map((b) => (
                          <a key={b.id} className="te-search-item" onClick={() => selectResult({ type: 'business', ...b })}>
                            <div className="te-search-item-icon"><i className="ti ti-flame" /></div>
                            <div>
                              <div className="te-search-item-name">{b.name}</div>
                              <div className="te-search-item-meta">{b.category || 'Business'}</div>
                            </div>
                          </a>
                        ))}
                      </>
                    )}
                    {recent.length === 0 && trending.length === 0 && (
                      <div className="te-search-hint">Start typing to search businesses and products...</div>
                    )}
                  </>
                )}

                {!showingIdle && searching && <SearchResultSkeleton />}

                {!showingIdle && !searching && !hasResults && (
                  <div className="te-search-empty">No results for "{query}". Try a different term.</div>
                )}

                {!showingIdle && !searching && results.businesses.length > 0 && (
                  <>
                    <div className="te-search-group-label">Businesses</div>
                    {results.businesses.map((b) => {
                      const idx = flatResults.findIndex((r) => r.type === 'business' && r.id === b.id);
                      return (
                        <a key={b.id} className={`te-search-item${activeIndex === idx ? ' active' : ''}`} onMouseEnter={() => setActiveIndex(idx)} onClick={() => selectResult({ type: 'business', ...b })}>
                          <div className="te-search-item-icon"><i className="ti ti-building-store" /></div>
                          <div>
                            <div className="te-search-item-name"><HighlightedText text={b.name} query={query} /></div>
                            <div className="te-search-item-meta">{b.category || 'Business'}</div>
                          </div>
                        </a>
                      );
                    })}
                  </>
                )}
                {!showingIdle && !searching && results.products.length > 0 && (
                  <>
                    <div className="te-search-group-label">Products</div>
                    {results.products.map((p) => {
                      const idx = flatResults.findIndex((r) => r.type === 'product' && r.id === p.id);
                      return (
                        <a key={p.id} className={`te-search-item${activeIndex === idx ? ' active' : ''}`} onMouseEnter={() => setActiveIndex(idx)} onClick={() => selectResult({ type: 'product', ...p })}>
                          <div className="te-search-item-icon"><i className="ti ti-package" /></div>
                          <div>
                            <div className="te-search-item-name"><HighlightedText text={p.name} query={query} /></div>
                            <div className="te-search-item-meta">{p.business_name || p.category || 'Product'}</div>
                          </div>
                        </a>
                      );
                    })}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
