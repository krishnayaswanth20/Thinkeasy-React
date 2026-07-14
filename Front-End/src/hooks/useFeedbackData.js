import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';
import { voterToken } from '../utils/feedbackShared';

export function useFeedbackData() {
  const [meta, setMeta] = useState(null);
  const [items, setItems] = useState(null); // null = loading
  const [votedIds, setVotedIds] = useState(new Set());
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [metaData, list, votes] = await Promise.all([
        api.getFeedbackMeta().catch(() => null),
        api.getTrendingFeedback('newest', 200).then((r) => (Array.isArray(r) ? r : [])).catch(() => []),
        // Ask for a broad set — the API doesn't expose a general public
        // "list all feedback" endpoint, only trending/pinned items, so
        // that's the dataset this page can browse, search, and filter.
        api.getFeedbackVotes(voterToken()).catch(() => ({ voted_ids: [] })),
      ]);
      setMeta(metaData);
      setItems(list);
      setVotedIds(new Set(votes.voted_ids || []));
    } catch (err) {
      setError(err);
      setItems([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const vote = useCallback(async (id) => {
    const voted = votedIds.has(id);
    try {
      const d = await api.voteFeedback(id, voterToken(), voted ? 'unvote' : 'vote');
      setItems((list) => (list || []).map((it) => (it.id === id ? { ...it, vote_count: d.vote_count } : it)));
      setVotedIds((prev) => {
        const next = new Set(prev);
        if (d.voted) next.add(id); else next.delete(id);
        return next;
      });
      return true;
    } catch {
      return false;
    }
  }, [votedIds]);

  return { meta, items, votedIds, vote, error, reload: load };
}

// Fetches the full detail (including admin_response) for a single feedback
// item, lazily, only when a card is expanded — the trending list endpoint
// doesn't include the admin reply fields, only the public single-item one.
export function useFeedbackDetailCache() {
  const [cache, setCache] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const fetchDetail = useCallback(async (id) => {
    if (cache[id]) return cache[id];
    setLoadingId(id);
    try {
      const detail = await api.getFeedbackItem(id);
      setCache((prev) => ({ ...prev, [id]: detail }));
      return detail;
    } catch {
      return null;
    } finally {
      setLoadingId((cur) => (cur === id ? null : cur));
    }
  }, [cache]);

  return { cache, loadingId, fetchDetail };
}

const SORTERS = {
  popular: (a, b) => (b.is_pinned - a.is_pinned) || (b.vote_count - a.vote_count) || (new Date(b.created_at) - new Date(a.created_at)),
  newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  updated: (a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at),
};

export function useFilteredFeedback(items, { query, status, sort }) {
  return useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    let list = items.filter((it) => {
      if (status && it.status !== status) return false;
      if (!q) return true;
      return (it.subject || '').toLowerCase().includes(q)
        || (it.message || '').toLowerCase().includes(q)
        || (it.category || '').toLowerCase().includes(q);
    });
    list = [...list].sort(SORTERS[sort] || SORTERS.popular);
    return list;
  }, [items, query, status, sort]);
}
