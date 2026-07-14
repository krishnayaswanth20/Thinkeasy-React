const KEY = 'te_feedback_draft_v1';

export const FeedbackDraft = {
  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      return raw && typeof raw === 'object' ? raw : null;
    } catch {
      return null;
    }
  },
  save(form) {
    try { localStorage.setItem(KEY, JSON.stringify(form)); } catch { /* noop */ }
  },
  clear() {
    try { localStorage.removeItem(KEY); } catch { /* noop */ }
  },
};
