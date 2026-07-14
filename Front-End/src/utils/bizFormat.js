export function safeJSON(v) {
  if (!v) return null;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return null; }
}

export function fmtIndian(n) {
  const num = parseFloat(String(n).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return null;
  if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)} L Cr`;
  if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)} B`;
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)} Cr`;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)} Lakh`;
  return `₹${num.toLocaleString('en-IN')}`;
}

export function calcCAGR(data) {
  if (!data || data.length < 2) return '';
  const f = data[0], l = data[data.length - 1];
  if (!f || !l || f <= 0) return '';
  const c = (Math.pow(l / f, 1 / (data.length - 1)) - 1) * 100;
  if (isNaN(c)) return '';
  return `${c >= 0 ? '+' : ''}${c.toFixed(1)}% CAGR`;
}

export function fmtProfit(arr) {
  if (!arr || !arr.length) return '—';
  const t = arr.reduce((a, b) => a + (Number(b) || 0), 0);
  return `₹${t.toFixed(1)} L`;
}

export function parseGrowthChart(raw) {
  const obj = safeJSON(raw);
  if (!obj) return { labels: [], data: [] };
  if (!Array.isArray(obj) && obj.labels && (obj.values || obj.data)) {
    return { labels: obj.labels.map(String), data: (obj.values || obj.data).map(Number) };
  }
  if (!Array.isArray(obj) && obj.datasets) {
    return { labels: (obj.labels || []).map(String), data: ((obj.datasets[0] || {}).data || []).map(Number) };
  }
  if (Array.isArray(obj)) {
    const sy = new Date().getFullYear();
    const d = obj.map(Number).filter((n) => !isNaN(n));
    return { labels: d.map((_, i) => String(sy + i)), data: d };
  }
  return { labels: [], data: [] };
}

export function parseProfitProjection(raw) {
  const obj = safeJSON(raw);
  if (!obj) {
    if (typeof raw === 'string') {
      const a = raw.split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
      return { labels: a.map((_, i) => `Year ${i + 1}`), data: a };
    }
    return { labels: [], data: [] };
  }
  if (Array.isArray(obj)) {
    const d = obj.map(Number).filter((n) => !isNaN(n));
    return { labels: d.map((_, i) => `Year ${i + 1}`), data: d };
  }
  if (obj.datasets) return { labels: obj.labels || [], data: ((obj.datasets[0] || {}).data || []).map(Number) };
  if (obj.data || obj.values) {
    const raw2 = obj.data || obj.values;
    return { labels: obj.labels || raw2.map((_, i) => `Year ${i + 1}`), data: raw2.map(Number) };
  }
  return { labels: [], data: [] };
}

export function parseInvestmentChart(raw) {
  const ri = safeJSON(raw);
  if (!ri) return { labels: [], data: [] };
  if (ri.datasets) return { labels: ri.labels || [], data: ((ri.datasets[0] || {}).data || []).map(Number) };
  return { labels: ri.labels || [], data: (ri.values || ri.data || []).map(Number) };
}

export const DONUT_COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
