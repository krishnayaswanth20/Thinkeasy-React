import { useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';
import { computeScores } from '../utils/scoring';

// Normalizes a raw category row the same way the legacy loadCategories() did.
function normalizeCategory(cat) {
  return cat;
}

// Normalizes a raw business row the same way the legacy loadBusinesses() did.
function normalizeBusiness(row, categoryLookup) {
  const cat = categoryLookup[row.category_id] || {};
  return {
    id: row.id,
    name: row.name || '',
    category: cat.name || row.category || row.category_name || '',
    categorySlug: cat.slug || row.category_slug || '',
    marketSize: row.market_size || row.marketSize || '',
    growthRate: row.growth_rate || row.growthRate || '',
    investment: row.investment || row.min_investment || '',
    profitMargin: row.profit_margin || row.profitMargin || row.margin || '',
    breakeven: row.breakeven || row.breakeven_period || row.payback_period || '',
    overview: row.overview || '',
  };
}

function normalizeProduct(row) {
  return {
    id: row.id,
    name: row.name || '',
    businessId: row.business_id || null,
    businessName: row.business_name || '',
    category: row.category_name || '',
    overview: row.overview || '',
  };
}

// Loads categories/businesses/products from the Flask API (same endpoints
// the legacy index.html called), normalizes them, and computes the
// trend/ROI composite scores. Re-run `bumpScores()` after any localStorage
// activity change (view/search-click/watchlist toggle) to re-rank sections.
export function useHomeData() {
  const [categories, setCategories] = useState([]);
  const [rawBusinesses, setRawBusinesses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreTick, setScoreTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const cats = await api.getCategories();
        if (cancelled) return;
        const categoryLookup = {};
        cats.forEach((c) => { if (c && c.id != null) categoryLookup[c.id] = c; });
        setCategories(cats.map(normalizeCategory));

        const [bizRows, prodRows] = await Promise.all([
          api.getBusinesses(),
          api.getProducts(),
        ]);
        if (cancelled) return;
        setRawBusinesses(bizRows.map((r) => normalizeBusiness(r, categoryLookup)));
        setProducts(prodRows.map(normalizeProduct));
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Re-derive scores whenever raw data changes OR the caller asks for a
  // refresh (e.g. after a view/search-click updates localStorage Activity).
  const businesses = useMemo(
    () => computeScores(rawBusinesses),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawBusinesses, scoreTick],
  );

  const refreshScores = () => setScoreTick((t) => t + 1);

  return { categories, businesses, products, loading, error, refreshScores };
}
