import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fmtIndian } from '../../utils/bizFormat';

export default function RelatedCarousel({ items, currentId, title = 'Related Businesses', basePath = '/business' }) {
  const trackRef = useRef(null);
  const navigate = useNavigate();

  const related = (items || []).filter((b) => String(b.id) !== String(currentId)).slice(0, 10);
  if (related.length === 0) {
    return <p className="no-data">No related businesses in this category yet.</p>;
  }

  function scrollBy(dir) {
    trackRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  }

  return (
    <div className="related-carousel">
      <div className="related-carousel-head">
        <span>{title}</span>
        <div className="related-carousel-nav">
          <button type="button" aria-label="Scroll left" onClick={() => scrollBy(-1)}><i className="ti ti-chevron-left" /></button>
          <button type="button" aria-label="Scroll right" onClick={() => scrollBy(1)}><i className="ti ti-chevron-right" /></button>
        </div>
      </div>
      <div className="related-carousel-track" ref={trackRef}>
        {related.map((b) => (
          <div key={b.id} className="related-carousel-card" onClick={() => navigate(`${basePath}/${b.id}`)}>
            <span className="related-carousel-name">{b.name}</span>
            <span className="related-carousel-meta">{b.category_name || b.category || 'Business'}</span>
            <span className="related-carousel-market">{fmtIndian(b.market_size || b.marketSize) || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
