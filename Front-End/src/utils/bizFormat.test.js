import { describe, it, expect } from 'vitest';
import {
  safeJSON, fmtIndian, calcCAGR, fmtProfit, parseGrowthChart, parseProfitProjection, parseInvestmentChart,
} from './bizFormat';

describe('safeJSON', () => {
  it('parses a JSON string', () => {
    expect(safeJSON('{"a":1}')).toEqual({ a: 1 });
  });
  it('passes through an already-parsed object', () => {
    expect(safeJSON({ a: 1 })).toEqual({ a: 1 });
  });
  it('returns null for invalid JSON or empty input', () => {
    expect(safeJSON('not json')).toBeNull();
    expect(safeJSON(null)).toBeNull();
  });
});

describe('fmtIndian', () => {
  it('formats crores', () => {
    expect(fmtIndian('50000000')).toBe('₹5.00 Cr');
  });
  it('formats lakhs', () => {
    expect(fmtIndian('500000')).toBe('₹5.00 Lakh');
  });
  it('returns null for non-numeric input', () => {
    expect(fmtIndian('n/a')).toBeNull();
  });
});

describe('calcCAGR', () => {
  it('computes a positive CAGR for growth', () => {
    expect(calcCAGR([100, 121])).toBe('+21.0% CAGR');
  });
  it('computes CAGR correctly across multiple periods', () => {
    // 100 -> 100*1.1^3 = 133.1 over 3 periods should read back as +10%/period
    expect(calcCAGR([100, 110, 121, 133.1])).toBe('+10.0% CAGR');
  });
  it('returns empty string for fewer than 2 points', () => {
    expect(calcCAGR([100])).toBe('');
    expect(calcCAGR(null)).toBe('');
  });
});

describe('fmtProfit', () => {
  it('sums an array and formats it in lakhs', () => {
    expect(fmtProfit([1, 2, 3])).toBe('₹6.0 L');
  });
  it('returns em dash for empty input', () => {
    expect(fmtProfit([])).toBe('—');
  });
});

describe('parseGrowthChart', () => {
  it('parses a {labels, values} shape', () => {
    const result = parseGrowthChart(JSON.stringify({ labels: ['2024', '2025'], values: [10, 20] }));
    expect(result).toEqual({ labels: ['2024', '2025'], data: [10, 20] });
  });
  it('generates year labels for a plain array', () => {
    const result = parseGrowthChart(JSON.stringify([5, 10, 15]));
    expect(result.data).toEqual([5, 10, 15]);
    expect(result.labels).toHaveLength(3);
  });
  it('returns empty arrays for missing data', () => {
    expect(parseGrowthChart(null)).toEqual({ labels: [], data: [] });
  });
});

describe('parseProfitProjection', () => {
  it('labels a plain array by year', () => {
    const result = parseProfitProjection(JSON.stringify([1, 2, 3]));
    expect(result.labels).toEqual(['Year 1', 'Year 2', 'Year 3']);
    expect(result.data).toEqual([1, 2, 3]);
  });
});

describe('parseInvestmentChart', () => {
  it('parses labels/values', () => {
    const result = parseInvestmentChart(JSON.stringify({ labels: ['Equipment'], values: [60] }));
    expect(result).toEqual({ labels: ['Equipment'], data: [60] });
  });
});
