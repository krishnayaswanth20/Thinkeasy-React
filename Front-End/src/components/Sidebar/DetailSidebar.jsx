import { useEffect, useState } from 'react';

const LINKS = [
  { id: 'section-overview', label: 'Overview', icon: 'ti-layout-dashboard' },
  { id: 'section-roadmap', label: 'Roadmap', icon: 'ti-route' },
  { id: 'section-suppliers', label: 'Suppliers', icon: 'ti-world' },
  { id: 'section-competitors', label: 'Competitors', icon: 'ti-users' },
  { id: 'section-analytics', label: 'Analytics', icon: 'ti-chart-bar' },
  { id: 'section-roi-calc', label: 'ROI Calculator', icon: 'ti-calculator' },
  { id: 'section-swot', label: 'SWOT', icon: 'ti-layout-grid' },
  { id: 'section-revenue', label: 'Revenue', icon: 'ti-chart-arcs' },
  { id: 'section-risks', label: 'Risks', icon: 'ti-alert-triangle' },
  { id: 'section-opportunities', label: 'Opportunities', icon: 'ti-clock' },
  { id: 'section-ai', label: 'AI Advisor', icon: 'ti-robot' },
  { id: 'section-sources', label: 'Sources', icon: 'ti-file-text' },
  { id: 'section-schemes', label: 'Gov. Schemes', icon: 'ti-shield-check' },
  { id: 'section-products', label: 'Related Products', icon: 'ti-package' },
];

export default function DetailSidebar() {
  const [active, setActive] = useState('section-overview');

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY + 140;
      let current = LINKS[0].id;
      for (const link of LINKS) {
        const el = document.getElementById(link.id);
        if (el && el.offsetTop <= y) current = link.id;
      }
      setActive(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <aside className="sidebar-nav">
      <div className="sidebar-nav-header">Navigation</div>
      <nav className="sidebar-nav-links">
        {LINKS.map((l) => (
          <a
            key={l.id}
            className={`sidebar-nav-link${active === l.id ? ' active' : ''}`}
            href={`#${l.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <i className={`ti ${l.icon}`} />{l.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
