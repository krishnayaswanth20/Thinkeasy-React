export const FEEDBACK_CATS = [
  { v: 'Bug Report', i: '🐞' }, { v: 'Feature Request', i: '💡' },
  { v: 'Business Suggestion', i: '📈' }, { v: 'Product Improvement', i: '⭐' },
  { v: 'Technical Issue', i: '⚙️' }, { v: 'General Feedback', i: '❤️' },
  { v: 'Question', i: '❓' }, { v: 'New Business Idea', i: '🚀' },
];

export const STATUS_DOT = { 'Under Review': '🟡', Planned: '🔵', 'In Progress': '🟣', 'In Development': '🟣', Released: '🟢', Rejected: '🔴' };
export const STATUS_CLASS = { 'Under Review': 's-under-review', Planned: 's-planned', 'In Progress': 's-in-progress', 'In Development': 's-in-development', Released: 's-released', Rejected: 's-rejected' };

export function voterToken() {
  let t = localStorage.getItem('te_vt');
  if (!t) {
    t = window.crypto?.randomUUID ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('te_vt', t);
  }
  return t;
}

export function timeAgoShort(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? 'today' : d === 1 ? '1d ago' : d < 30 ? `${d}d ago` : d < 365 ? `${Math.floor(d / 30)}mo ago` : `${Math.floor(d / 365)}y ago`;
}
