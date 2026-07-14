import { describe, it, expect } from 'vitest';
import {
  parseNumeric, formatGrowth, formatPercent, tagClassFor, investLevelLabel, timeAgo,
} from './format';

describe('parseNumeric', () => {
  it('strips currency symbols and commas', () => {
    expect(parseNumeric('₹1,20,000')).toBe(120000);
  });
  it('handles plain numbers', () => {
    expect(parseNumeric('42.5')).toBe(42.5);
  });
  it('returns NaN for null/empty', () => {
    expect(parseNumeric(null)).toBeNaN();
    expect(parseNumeric('')).toBeNaN();
  });
});

describe('formatGrowth', () => {
  it('prefixes a plus sign', () => {
    expect(formatGrowth('18')).toBe('+18%');
  });
  it('falls back to em dash when empty', () => {
    expect(formatGrowth('')).toBe('—');
    expect(formatGrowth(null)).toBe('—');
  });
  it('returns the raw string when not numeric', () => {
    expect(formatGrowth('n/a')).toBe('n/a');
  });
});

describe('formatPercent', () => {
  it('appends a percent sign', () => {
    expect(formatPercent('25')).toBe('25%');
  });
  it('falls back to em dash when empty', () => {
    expect(formatPercent('')).toBe('—');
  });
});

describe('tagClassFor', () => {
  it('maps known categories to their tag class', () => {
    expect(tagClassFor('Food')).toBe('tag-food');
    expect(tagClassFor('Technology')).toBe('tag-tech');
  });
  it('is case-insensitive', () => {
    expect(tagClassFor('RETAIL')).toBe('tag-retail');
  });
  it('falls back to manufacturing for unknown categories', () => {
    expect(tagClassFor('Something Unknown')).toBe('tag-mfg');
  });
});

describe('investLevelLabel', () => {
  it('returns the correct label/class for each tier', () => {
    expect(investLevelLabel('low')).toEqual({ label: 'Low Investment', cls: 'tag-invest-low' });
    expect(investLevelLabel('high').label).toBe('High Investment');
  });
  it('returns null for an unrecognized tier', () => {
    expect(investLevelLabel(undefined)).toBeNull();
  });
});

describe('timeAgo', () => {
  it('formats recent timestamps in minutes', () => {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    expect(timeAgo(oneMinuteAgo)).toMatch(/m ago$/);
  });
  it('formats older timestamps in days', () => {
    const twoDaysAgo = Date.now() - 2 * 86400000;
    expect(timeAgo(twoDaysAgo)).toMatch(/d ago$/);
  });
});
