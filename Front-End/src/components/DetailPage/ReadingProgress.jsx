import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setPct(scrollable > 0 ? Math.min(100, (doc.scrollTop / scrollable) * 100) : 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 700, background: 'transparent' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#4f46e5,#2563eb)', transition: 'width 80ms linear' }} />
    </div>
  );
}
