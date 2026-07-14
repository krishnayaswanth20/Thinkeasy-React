import { useCallback, useRef } from 'react';
import * as api from '../services/api';
import { computeScores } from '../utils/scoring';

// Module-level cache — every Navbar/StickySearchBar instance shares one
// fetch instead of each re-requesting businesses/products on mount.
let cache = null; // { businesses, products } | null
let inflight = null;

async function loadAll() {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = Promise.all([api.getBusinesses(), api.getProducts()])
    .then(([businesses, products]) => {
      cache = { businesses, products };
      inflight = null;
      return cache;
    })
    .catch((err) => { inflight = null; throw err; });
  return inflight;
}

export function useSearchData() {
  const ref = useRef(cache);

  const ensureLoaded = useCallback(async () => {
    const data = await loadAll();
    ref.current = data;
    return data;
  }, []);

  // Top N businesses by the same composite trend score Home uses —
  // gives "trending searches" real signal instead of a static list.
  const getTrending = useCallback((limit = 6) => {
    if (!ref.current) return [];
    const scored = computeScores(ref.current.businesses).sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0));
    return scored.slice(0, limit);
  }, []);

  return { ensureLoaded, getTrending, getCached: () => ref.current };
}
