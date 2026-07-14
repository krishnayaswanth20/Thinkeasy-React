import { describe, it, expect } from 'vitest';
import { Compare, COMPARE_MAX } from './compare';

describe('Compare', () => {
  it('adds up to COMPARE_MAX items and then blocks further additions', () => {
    for (let i = 1; i <= COMPARE_MAX; i += 1) {
      const result = Compare.toggle(i);
      expect(result.added).toBe(true);
    }
    expect(Compare.count()).toBe(COMPARE_MAX);

    const blocked = Compare.toggle(999);
    expect(blocked.blocked).toBe('max');
    expect(Compare.count()).toBe(COMPARE_MAX);
  });

  it('toggling an existing id removes it', () => {
    Compare.toggle(5);
    const result = Compare.toggle(5);
    expect(result.removed).toBe(true);
    expect(Compare.has(5)).toBe(false);
  });

  it('remove() takes a specific id out regardless of position', () => {
    Compare.toggle(1);
    Compare.toggle(2);
    Compare.remove(1);
    expect(Compare.getIds()).toEqual(['2']);
  });

  it('clear() empties the whole list', () => {
    Compare.toggle(1);
    Compare.toggle(2);
    Compare.clear();
    expect(Compare.count()).toBe(0);
  });
});
