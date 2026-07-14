import { useEffect, useRef } from 'react';

// Calls onIntersect whenever the returned ref's element becomes visible.
// Used as an infinite-scroll sentinel (no external dependency needed).
export function useInfiniteScrollSentinel(onIntersect, { enabled = true, rootMargin = '200px' } = {}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const el = sentinelRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onIntersect(); },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onIntersect]);

  return sentinelRef;
}
