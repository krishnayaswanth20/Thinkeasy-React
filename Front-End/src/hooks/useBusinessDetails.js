import { useEffect, useState } from 'react';
import client, { API_URL } from '../services/api';

// Ported 1:1 from legacy loadBusiness(): tries /business/:id then
// /product/:id (or a single one if ?source= hints which), and fetches
// related products for businesses that don't already carry them.
export function useBusinessDetails(id, sourceHint) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'content'
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    if (!id) {
      setStatus('error');
      setErrorInfo({ title: 'No Business ID', message: 'Please open this page with a valid id.' });
      return;
    }
    let cancelled = false;
    setStatus('loading');
    setData(null);

    async function load() {
      const endpoints = sourceHint === 'product'
        ? [`/product/${id}`]
        : sourceHint === 'business'
          ? [`/business/${id}`]
          : [`/business/${id}`, `/product/${id}`];

      try {
        let found = null;
        for (const path of endpoints) {
          let resp;
          try {
            resp = await client.get(path);
          } catch (err) {
            if (err?.response?.status === 404) continue;
            if (err?.response) throw new Error(`HTTP ${err.response.status}`);
            continue; // network hiccup on this endpoint — try the next
          }
          const json = resp.data;
          if (json && json.id) {
            json.category = json.category || json.category_name || '';
            json._source = path.includes('/product/') ? 'product' : 'business';
            found = json;
            break;
          }
        }

        if (!found) {
          if (cancelled) return;
          setStatus('error');
          setErrorInfo({ title: 'Opportunity Not Found', message: `No opportunity with ID "${id}" could be found. It may have been removed.` });
          return;
        }

        if (!found.related_products && !found.relatedProducts && found._source === 'business' && found.id) {
          try {
            const pr = await client.get(`/products/by-business/${found.id}`);
            if (Array.isArray(pr.data)) found.related_products = pr.data.filter((p) => !p.is_hidden);
          } catch { /* non-fatal */ }
        }

        if (cancelled) return;
        setData(found);
        setStatus('content');
      } catch (err) {
        if (cancelled) return;
        const msg = String(err?.message || '');
        const isConn = msg.includes('Network Error') || msg.includes('Failed to fetch');
        setStatus('error');
        setErrorInfo({
          title: isConn ? 'Cannot Connect to Server' : 'Unable to Load Opportunity',
          message: isConn ? `Make sure the API is reachable at ${API_URL}. Then refresh this page.` : (err.message || 'An unexpected error occurred.'),
        });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, sourceHint]);

  return { data, status, errorInfo };
}
