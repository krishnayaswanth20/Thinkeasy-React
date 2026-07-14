// WATCHLIST — the visitor's own saved opportunities. Pure localStorage,
// one browser, no account required. Ported 1:1 from legacy index.html.

const WATCHLIST_KEY = 'te_watchlist_v1';

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(WATCHLIST_KEY));
    return Array.isArray(raw) ? raw.map(String) : [];
  } catch {
    return [];
  }
}

function write(ids) {
  try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids)); } catch { /* noop */ }
}

export const Watchlist = {
  has(id) { return read().includes(String(id)); },
  // Returns true if the item is now saved, false if it was just removed.
  toggle(id) {
    const ids = read();
    const key = String(id);
    const idx = ids.indexOf(key);
    if (idx >= 0) { ids.splice(idx, 1); write(ids); return false; }
    ids.unshift(key);
    write(ids);
    return true;
  },
  getIds() { return read(); },
  count() { return read().length; },
};
