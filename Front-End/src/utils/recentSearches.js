const KEY = 'te_recent_searches_v1';
const MAX = 8;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
}

// Each entry: { type: 'business'|'product', id, name, at }
export const RecentSearches = {
  getAll() { return read(); },
  add(entry) {
    const list = read().filter((e) => !(e.type === entry.type && String(e.id) === String(entry.id)));
    list.unshift({ ...entry, at: Date.now() });
    write(list.slice(0, MAX));
  },
  clear() { write([]); },
};
