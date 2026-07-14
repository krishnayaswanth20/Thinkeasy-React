import { describe, it, expect } from 'vitest';
import { Watchlist } from './watchlist';

describe('Watchlist', () => {
  it('starts empty', () => {
    expect(Watchlist.count()).toBe(0);
    expect(Watchlist.has(1)).toBe(false);
  });

  it('toggle adds then removes an id', () => {
    const added = Watchlist.toggle(42);
    expect(added).toBe(true);
    expect(Watchlist.has(42)).toBe(true);
    expect(Watchlist.count()).toBe(1);

    const removed = Watchlist.toggle(42);
    expect(removed).toBe(false);
    expect(Watchlist.has(42)).toBe(false);
    expect(Watchlist.count()).toBe(0);
  });

  it('coerces ids to strings for comparison', () => {
    Watchlist.toggle(7);
    expect(Watchlist.has('7')).toBe(true);
  });

  it('newest saved item is first in getIds()', () => {
    Watchlist.toggle(1);
    Watchlist.toggle(2);
    expect(Watchlist.getIds()[0]).toBe('2');
  });
});
