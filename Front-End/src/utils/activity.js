// ACTIVITY TRACKING — client-side signal for "most viewed" / "most
// searched" / "trending" / "recently popular". Records views + search
// clicks per business in localStorage, decayed by recency (a week-long
// half-life) so recent activity counts more than old activity.
// Ported 1:1 from the legacy index.html Activity module.

const ACTIVITY_KEY = 'te_activity_v1';
const ACTIVITY_HALF_LIFE_DAYS = 7;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(ACTIVITY_KEY));
    return raw && typeof raw === 'object' ? raw : { views: {}, searchClicks: {} };
  } catch {
    return { views: {}, searchClicks: {} };
  }
}

function write(data) {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — fail silently */
  }
}

function bump(bucket, id) {
  if (id == null || id === '') return;
  const data = read();
  if (!data[bucket]) data[bucket] = {};
  const key = String(id);
  const prev = data[bucket][key] || { count: 0, last: 0 };
  data[bucket][key] = { count: prev.count + 1, last: Date.now() };
  write(data);
}

export const Activity = {
  KEY: ACTIVITY_KEY,
  recordView(id) { bump('views', id); },
  recordSearchClick(id) { bump('searchClicks', id); },
  getViews() { return read().views || {}; },

  // Decayed engagement score for one business — recent activity counts more.
  getEngagement(id) {
    const data = read();
    const key = String(id);
    const now = Date.now();
    const decayed = (entry) => {
      if (!entry) return 0;
      const ageDays = (now - entry.last) / 86400000;
      return entry.count * Math.pow(0.5, ageDays / ACTIVITY_HALF_LIFE_DAYS);
    };
    const viewScore = decayed(data.views?.[key]) * 1.5;
    const searchScore = decayed(data.searchClicks?.[key]) * 2.5;
    return viewScore + searchScore;
  },

  // Categories the visitor has shown interest in, most-weighted first.
  getTopCategories(businesses, limit = 3) {
    const data = read();
    const counts = {};
    const tally = (bucket, weight) => {
      Object.entries(data[bucket] || {}).forEach(([id, entry]) => {
        const biz = businesses.find((b) => String(b.id) === id);
        if (!biz || !biz.category) return;
        counts[biz.category] = (counts[biz.category] || 0) + entry.count * weight;
      });
    };
    tally('views', 1);
    tally('searchClicks', 1.5);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map((e) => e[0]).slice(0, limit);
  },

  // True only if the visitor has an actual recorded *view* in this category.
  hasViewedCategory(businesses, category) {
    if (!category) return false;
    const data = read();
    return Object.keys(data.views || {}).some((id) => {
      const biz = businesses.find((b) => String(b.id) === id);
      return biz && biz.category === category;
    });
  },
};

/* ── Visit tracker — identifies a genuine returning visitor via a
   30-minute session-gap rule. ─────────────────────────────────────── */
const VISIT_KEY = 'te_visit_v1';
const VISIT_SESSION_GAP_MS = 30 * 60 * 1000;

export function trackVisit() {
  let data;
  try { data = JSON.parse(localStorage.getItem(VISIT_KEY)) || {}; } catch { data = {}; }
  const now = Date.now();
  const isReturning = !!data.lastVisit;
  const isNewSession = !data.lastVisit || (now - data.lastVisit > VISIT_SESSION_GAP_MS);
  if (isNewSession) data.visitCount = (data.visitCount || 0) + 1;
  data.lastVisit = now;
  try { localStorage.setItem(VISIT_KEY, JSON.stringify(data)); } catch { /* noop */ }
  return { isReturning, visitCount: data.visitCount || 1 };
}
