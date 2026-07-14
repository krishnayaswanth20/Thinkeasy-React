import { describe, it, expect } from 'vitest';
import { computeScores } from './scoring';

const sample = [
  { id: 1, name: 'A', growthRate: '10%', profitMargin: '20%', marketSize: '1000000', investment: '500000' },
  { id: 2, name: 'B', growthRate: '30%', profitMargin: '35%', marketSize: '5000000', investment: '200000' },
  { id: 3, name: 'C', growthRate: '5%', profitMargin: '10%', marketSize: '200000', investment: '2000000' },
];

describe('computeScores', () => {
  it('returns an empty array for empty input', () => {
    expect(computeScores([])).toEqual([]);
    expect(computeScores(null)).toEqual([]);
  });

  it('annotates every business with trendScore, roiScore, and investmentTier', () => {
    const scored = computeScores(sample);
    expect(scored).toHaveLength(3);
    scored.forEach((b) => {
      expect(typeof b.trendScore).toBe('number');
      expect(typeof b.roiScore).toBe('number');
      expect(['low', 'med', 'high']).toContain(b.investmentTier);
    });
  });

  it('does not mutate the input array', () => {
    const copy = JSON.parse(JSON.stringify(sample));
    computeScores(sample);
    expect(sample).toEqual(copy);
  });

  it('ranks the business with higher growth/margin/market size higher on ROI', () => {
    const scored = computeScores(sample);
    const b = scored.find((x) => x.id === 2);
    const c = scored.find((x) => x.id === 3);
    // B has better growth, margin, and market size, and a lower
    // investment — it should clearly outrank C on ROI.
    expect(b.roiScore).toBeGreaterThan(c.roiScore);
  });

  it('assigns the lowest investment tier to the business with the smallest investment', () => {
    const scored = computeScores(sample);
    const lowestInvestment = scored.find((x) => x.id === 2); // 200000, smallest
    expect(lowestInvestment.investmentTier).toBe('low');
  });
});
