import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// Every test starts with a clean localStorage — several utils
// (Activity, Watchlist, Compare) persist state there.
afterEach(() => {
  localStorage.clear();
});
