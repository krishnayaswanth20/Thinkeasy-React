import { describe, it, expect } from 'vitest';
import { Activity } from './activity';

describe('Activity', () => {
  it('has zero engagement for an id with no recorded activity', () => {
    expect(Activity.getEngagement(999)).toBe(0);
  });

  it('recordView increases engagement for that id', () => {
    Activity.recordView(1);
    expect(Activity.getEngagement(1)).toBeGreaterThan(0);
  });

  it('search clicks are weighted higher than plain views', () => {
    Activity.recordView(1);
    Activity.recordSearchClick(2);
    expect(Activity.getEngagement(2)).toBeGreaterThan(Activity.getEngagement(1));
  });

  it('getTopCategories ranks the most-engaged category first', () => {
    const businesses = [
      { id: 1, category: 'Food' },
      { id: 2, category: 'Retail' },
    ];
    Activity.recordView(1);
    Activity.recordView(1);
    Activity.recordView(2);
    const top = Activity.getTopCategories(businesses, 2);
    expect(top[0]).toBe('Food');
  });

  it('hasViewedCategory is true only for an actually-viewed category', () => {
    const businesses = [{ id: 1, category: 'Food' }, { id: 2, category: 'Retail' }];
    Activity.recordView(1);
    expect(Activity.hasViewedCategory(businesses, 'Food')).toBe(true);
    expect(Activity.hasViewedCategory(businesses, 'Retail')).toBe(false);
  });
});
