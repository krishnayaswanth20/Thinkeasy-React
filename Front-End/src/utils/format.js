export function escHtml(str) {
  return String(str ?? '');
}

export function parseNumeric(val) {
  if (val == null) return NaN;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  return cleaned ? parseFloat(cleaned) : NaN;
}

export function formatGrowth(growthRaw) {
  if (!growthRaw) return '—';
  const n = parseFloat(growthRaw);
  return isNaN(n) ? growthRaw : `+${n}%`;
}

export function formatPercent(raw) {
  if (!raw) return '—';
  const n = parseFloat(raw);
  return isNaN(n) ? raw : `${n}%`;
}

// Splits `text` around the first case-insensitive occurrence of `query`
// so callers can wrap the middle part in <mark>. Returns the plain
// string unchanged when there's no match.
export function highlightMatch(text, query) {
  const str = String(text ?? '');
  if (!query) return str;
  const idx = str.toLowerCase().indexOf(String(query).toLowerCase());
  if (idx === -1) return str;
  return { before: str.slice(0, idx), match: str.slice(idx, idx + query.length), after: str.slice(idx + query.length) };
}

export function timeAgo(ms) {
  const diffMin = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

const TAG_CLASS_MAP = {
  manufacturing: 'tag-mfg',
  food: 'tag-food',
  agriculture: 'tag-agri',
  'renewable energy': 'tag-energy',
  energy: 'tag-energy',
  technology: 'tag-tech',
  retail: 'tag-retail',
};

export function tagClassFor(categoryName) {
  return TAG_CLASS_MAP[(categoryName || '').toLowerCase()] || 'tag-mfg';
}

export function investLevelLabel(tier) {
  if (tier === 'low') return { label: 'Low Investment', cls: 'tag-invest-low' };
  if (tier === 'high') return { label: 'High Investment', cls: 'tag-invest-high' };
  if (tier === 'med') return { label: 'Medium Investment', cls: 'tag-invest-med' };
  return null;
}
