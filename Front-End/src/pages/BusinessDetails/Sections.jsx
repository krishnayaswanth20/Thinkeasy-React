import { safeJSON, fmtIndian } from '../../utils/bizFormat';

export function HighlightPills({ badges }) {
  const list = safeJSON(badges);
  if (!list || !list.length) return <span style={{ color: 'var(--muted)', fontSize: 13 }}>No highlights added yet.</span>;
  return list.map((b, i) => (
    <span key={i} className={`hl-pill hl-pill-${i % 6} ${b.cls || ''}`}>{b.label || b}</span>
  ));
}

export function BadgesMeta({ badges }) {
  const list = safeJSON(badges);
  if (!list || !list.length) return <span className="biz-badge badge-blue">Business Opportunity</span>;
  return list.map((b, i) => <span key={i} className={`biz-badge ${b.cls || 'badge-blue'}`}>{b.label || b}</span>);
}

export function FinancialsTable({ rows }) {
  return (
    <table className="fin-table">
      <tbody>
        {rows.map(([label, value, unit]) => (
          <tr key={label}>
            <td className="fin-label">{label}</td>
            <td>{value ? <span className="fin-value">{value}{unit && <span className="unit">{unit}</span>}</span> : <span className="fin-na">Not Available</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SuppliersTable({ suppliers }) {
  const list = safeJSON(suppliers);
  if (!list || !list.length) return <p className="no-data">No supplier data available.</p>;
  return (
    <div className="table-scroll-wrap">
      <table className="data-table">
        <thead><tr><th>Supplier</th><th>Location</th><th>Type</th><th>Rating</th></tr></thead>
        <tbody>
          {list.map((s, i) => {
            const r = Number(s.rating) || 0;
            const rw = Math.min(100, r > 1 ? r : r * 100);
            const tc = s.type ? 'tag-blue' : 'tag-green';
            return (
              <tr key={i}>
                <td><strong>{s.name || '—'}</strong></td>
                <td>{s.location || s.description || '—'}</td>
                <td><span className={`tag ${tc}`}>{s.type || s.tag || '—'}</span></td>
                <td>{r ? (
                  <div className="rating-bar">
                    <div className="rating-track"><div className="rating-fill" style={{ width: `${rw}%` }} /></div>
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 28 }}>{r}</span>
                  </div>
                ) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CompetitorsTable({ competitors }) {
  const list = safeJSON(competitors);
  if (!list || !list.length) return <p className="no-data">No competitor data available.</p>;
  const tc = { High: 'tag-red', Medium: 'tag-amber', Low: 'tag-green' };
  return (
    <div className="table-scroll-wrap">
      <table className="data-table">
        <thead><tr><th>Company</th><th>Market Share</th><th>Size</th><th>Threat</th></tr></thead>
        <tbody>
          {list.map((c, i) => {
            const t = c.threat || c.tag || '—';
            return (
              <tr key={i}>
                <td><strong>{c.name || '—'}</strong></td>
                <td>{c.share || c.description || '—'}</td>
                <td>{c.size || '—'}</td>
                <td><span className={`tag ${tc[t] || 'tag-blue'}`}>{t}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SWOT({ biz }) {
  const sd = safeJSON(biz.swot) || {};
  const quads = [
    { cls: 's', label: 'Strengths', emoji: '💪', key: 'strengths' },
    { cls: 'w', label: 'Weaknesses', emoji: '⚠️', key: 'weaknesses' },
    { cls: 'o', label: 'Opportunities', emoji: '🚀', key: 'opportunities' },
    { cls: 't', label: 'Threats', emoji: '🛡️', key: 'threats' },
  ];
  return (
    <div className="swot-grid">
      {quads.map((q) => {
        const items = Array.isArray(sd[q.key]) ? sd[q.key] : [];
        const fallback = biz[q.key] || '';
        return (
          <div key={q.key} className={`swot-card ${q.cls}`}>
            <div className="swot-label">{q.emoji} {q.label}</div>
            {items.length
              ? items.map((it, i) => <div key={i} className="swot-item">{it}</div>)
              : fallback
                ? <div className="swot-item">{fallback}</div>
                : <div style={{ color: 'var(--muted)', fontSize: 12.5, padding: '4px 0' }}>No data added yet.</div>}
          </div>
        );
      })}
    </div>
  );
}

export function Risks({ biz }) {
  const risks = safeJSON(biz.risks);
  if (!risks || !risks.length) {
    const raw = biz.risk_factors || biz.riskFactors || biz.risks_text || '';
    if (!raw) return <p className="no-data">No risk data available.</p>;
    return (
      <div className="risk-list">
        <div className="risk-item"><span className="risk-badge risk-med">General</span><span className="risk-text">{raw}</span></div>
      </div>
    );
  }
  const lc = { High: 'risk-high', Medium: 'risk-med', Med: 'risk-med', Low: 'risk-low' };
  return (
    <div className="risk-list">
      {risks.map((r, i) => {
        const lv = r.level || r.severity || 'Med';
        return (
          <div key={i} className="risk-item">
            <span className={`risk-badge ${lc[lv] || 'risk-med'}`}>{lv}</span>
            <span className="risk-text">{r.text || r.description || r}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Opportunities({ biz, onNavigate }) {
  const opps = safeJSON(biz.opportunities_list || biz.opportunitiesList);
  if (!opps || !opps.length) {
    const raw = biz.opportunities || biz.opportunity_text || '';
    if (!raw) return <p className="no-data">No opportunity data available.</p>;
    return <div className="opp-grid"><div className="opp-card"><div className="opp-name">{raw}</div></div></div>;
  }
  return (
    <div className="opp-grid">
      {opps.map((o, i) => {
        const oId = o.id || o.business_id || o.product_id || '';
        const src = o.source || 'business';
        return (
          <div key={i} className="opp-card" onClick={() => oId && onNavigate(oId, src)}>
            <div className="opp-name">{o.name || o.title || '—'}</div>
            <div className="opp-meta">
              {o.investment && <span className="opp-tag">{o.investment}</span>}
              {o.growth && <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>▲ {o.growth}</span>}
              <span className="opp-arrow">→</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Roadmap({ roadmap }) {
  const list = safeJSON(roadmap);
  if (!list || !list.length) return <p className="roadmap-empty">No roadmap data available.</p>;
  return (
    <div className="roadmap-h-wrap">
      <div className="roadmap-h-track">
        {list.map((step, i) => {
          const st = step.status || (i === 0 ? 'active' : i < 2 ? 'done' : '');
          const dc = st === 'done' ? 'done' : st === 'active' ? 'active' : '';
          return (
            <div key={i} className="roadmap-h-step">
              <div className={`roadmap-h-dot ${dc}`}>{i + 1}</div>
              <div className="roadmap-h-body">
                <div className="roadmap-h-phase">{step.phase || step.title || `Phase ${i + 1}`}</div>
                <div className="roadmap-h-title">{step.title || step.phase || ''}</div>
                <div className="roadmap-h-desc">{step.desc || step.description || ''}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Sources({ biz }) {
  const sources = safeJSON(biz.business_sources || biz.businessSources || biz.sources);
  if (!sources || !sources.length) return <p className="no-data">No business sources added yet. Admin can add sources in the management panel.</p>;
  return (
    <div className="sources-list">
      {sources.map((s, i) => (
        <a key={i} className="source-item" href={s.url || s.link || '#'} target="_blank" rel="noopener noreferrer">
          <div className="source-icon">📄</div>
          <span className="source-name">{s.name || s.title || 'Source'}</span>
          <span className="source-arrow">↗</span>
        </a>
      ))}
    </div>
  );
}

export function Schemes({ biz }) {
  const schemes = safeJSON(biz.government_schemes || biz.governmentSchemes || biz.schemes);
  if (!schemes || !schemes.length) return <p className="no-data">No government schemes added yet.</p>;
  return (
    <div className="schemes-list">
      {schemes.map((s, i) => (
        <div key={i} className="scheme-item">
          <div className="scheme-header">
            <div className="scheme-check"><i className="ti ti-check" /></div>
            <span className="scheme-name">{s.name || s.title || '—'}</span>
          </div>
          {(s.description || s.desc) && <div className="scheme-desc">{s.description || s.desc}</div>}
          {(s.url || s.link) && <a className="scheme-learn" href={s.url || s.link} target="_blank" rel="noopener noreferrer">Learn More ↗</a>}
        </div>
      ))}
    </div>
  );
}

export function RelatedProducts({ biz, navigate }) {
  const products = safeJSON(biz.related_products || biz.relatedProducts);
  if (!products || !products.length) return <p className="no-data">No related products found under this business.</p>;
  return (
    <div className="products-grid">
      {products.map((p, i) => {
        const pId = p.id || p.product_id || '';
        const mktFmt = fmtIndian(p.market_size || p.marketSize || '') || (p.market_size || p.marketSize || '—');
        return (
          <div key={i} className="product-card" onClick={() => pId && navigate(`/product/${pId}`)}>
            <div className="product-card-name">{p.name || '—'}</div>
            <div className="product-card-metrics">
              <div className="product-metric"><span className="product-metric-label">Market Size</span><span className="product-metric-value">{String(mktFmt)}</span></div>
              {(p.growth_rate || p.growthRate) && (
                <div className="product-metric"><span className="product-metric-label">Growth Rate</span><span className="product-metric-value" style={{ color: 'var(--success)' }}>{p.growth_rate || p.growthRate}</span></div>
              )}
              {p.investment && (
                <div className="product-metric"><span className="product-metric-label">Investment</span><span className="product-metric-value">{p.investment}</span></div>
              )}
            </div>
            <div className="product-invest-bar"><div className="product-invest-fill" style={{ width: '65%' }} /></div>
          </div>
        );
      })}
    </div>
  );
}

export function AIAdvisor({ biz }) {
  const name = biz.name || 'this business';
  function ask(q) {
    window.alert(`AI Advisor for "${name}"\n\nYour question: "${q}"\n\nAI advisor integration coming soon.`);
  }
  return (
    <div className="ai-chat">
      <div className="ai-msg">
        <div className="ai-avatar"><i className="ti ti-atom-2" /></div>
        <div className="ai-text">Hello! I'm your AI Business Advisor for <strong>{name}</strong>. Ask me anything about this opportunity!</div>
      </div>
      <div className="ai-prompt-grid">
        <button className="ai-prompt" onClick={() => ask('What is the minimum investment required?')}>💰 Investment required?</button>
        <button className="ai-prompt" onClick={() => ask('What are the key risks?')}>⚠️ Key risks to know</button>
        <button className="ai-prompt" onClick={() => ask('What is the profit potential?')}>📈 Profit potential</button>
        <button className="ai-prompt" onClick={() => ask('Is this a good time to start?')}>🎯 Right time to start?</button>
      </div>
    </div>
  );
}
