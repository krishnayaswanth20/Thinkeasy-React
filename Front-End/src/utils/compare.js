// COMPARE — lets a visitor select up to 3 businesses and see them
// side-by-side. Mirrors Watchlist's localStorage pattern. Ported 1:1
// from legacy index.html.

const COMPARE_KEY = 'te_compare_v1';
export const COMPARE_MAX = 3;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPARE_KEY));
    return Array.isArray(raw) ? raw.map(String) : [];
  } catch {
    return [];
  }
}

function write(ids) {
  try { localStorage.setItem(COMPARE_KEY, JSON.stringify(ids)); } catch { /* noop */ }
}

export const Compare = {
  has(id) { return read().includes(String(id)); },
  // Returns { added: true } / { removed: true } / { blocked: 'max' }.
  toggle(id) {
    const ids = read();
    const key = String(id);
    const idx = ids.indexOf(key);
    if (idx >= 0) { ids.splice(idx, 1); write(ids); return { removed: true }; }
    if (ids.length >= COMPARE_MAX) return { blocked: 'max' };
    ids.push(key);
    write(ids);
    return { added: true };
  },
  remove(id) {
    const ids = read().filter((x) => x !== String(id));
    write(ids);
  },
  clear() { write([]); },
  getIds() { return read(); },
  count() { return read().length; },
};
