// Analytics is entirely opt-in: nothing loads, and every call below is a
// silent no-op, unless VITE_GA_MEASUREMENT_ID / VITE_CLARITY_PROJECT_ID
// are set at build time (see .env.example). No tracking ships by default.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  initialized = true;

  if (GA_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line func-names
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });
  }

  if (CLARITY_ID) {
    /* eslint-disable */
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    /* eslint-enable */
  }
}

export function trackPageView(path, title) {
  if (GA_ID && window.gtag) {
    window.gtag('event', 'page_view', { page_path: path, page_title: title });
  }
}

export function trackEvent(name, params = {}) {
  if (GA_ID && window.gtag) {
    window.gtag('event', name, params);
  }
}

// Convenience wrappers for the events this app actually emits.
export const analytics = {
  search: (query, resultCount) => trackEvent('search', { search_term: query, result_count: resultCount }),
  viewBusiness: (id, name) => trackEvent('view_item', { item_id: id, item_name: name }),
  feedbackSubmitted: (category) => trackEvent('feedback_submitted', { category }),
  feedbackVoted: (id) => trackEvent('feedback_voted', { feedback_id: id }),
  importCompleted: (entity, summary) => trackEvent('import_completed', { entity, ...summary }),
};
