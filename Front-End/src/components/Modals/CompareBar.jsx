import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compare } from '../../utils/compare';
import { parseNumeric, formatGrowth } from '../../utils/format';

// Picks the best real value in a row across the selected businesses.
function highlightWinner(values, lowerIsBetter) {
  const nums = values.map((v) => parseNumeric(v));
  const valid = nums.filter((n) => !isNaN(n));
  if (valid.length === 0) return nums.map(() => false);
  const best = lowerIsBetter ? Math.min(...valid) : Math.max(...valid);
  const tieCount = valid.filter((n) => n === best).length;
  return nums.map((n) => !isNaN(n) && n === best && tieCount === 1);
}

export default function CompareBar({ businesses, refreshTick, onChange }) {
  const [ids, setIds] = useState(Compare.getIds());
  const [modalOpen, setModalOpen] = useState(false);
  const [hint, setHint] = useState('');
  const navigate = useNavigate();

  useEffect(() => { setIds(Compare.getIds()); }, [refreshTick]);

  const items = ids.map((id) => businesses.find((b) => String(b.id) === id)).filter(Boolean);

  function sync() {
    setIds(Compare.getIds());
    onChange?.();
  }

  function remove(id) {
    Compare.remove(id);
    sync();
  }

  function clear() {
    Compare.clear();
    sync();
  }

  function openModal() {
    if (items.length < 2) {
      setHint('Add at least 1 more business to compare.');
      setTimeout(() => setHint(''), 2400);
      return;
    }
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    setModalOpen(false);
    document.body.style.overflow = '';
  }

  if (items.length === 0) return null;

  const rows = [
    { label: 'Category', get: (b) => b.category || 'General', numeric: false },
    { label: 'Investment', get: (b) => b.investment || null, numeric: true, lowerIsBetter: true, badge: 'Lowest Entry' },
    { label: 'Market Size', get: (b) => b.marketSize || null, numeric: true },
    { label: 'Growth Rate', get: (b) => formatGrowth(b.growthRate), numeric: true, badge: 'Fastest Growth' },
    { label: 'ROI Score', get: (b) => Math.round((b.roiScore || 0) * 100), numeric: true, badge: 'Best ROI' },
    { label: 'Trending Score', get: (b) => Math.round((b.trendScore || 0) * 10) / 10, numeric: true },
    { label: 'Breakeven', get: (b) => b.breakeven || null, numeric: true, lowerIsBetter: true, badge: 'Fastest Breakeven' },
  ];

  return (
    <>
      <div className={`cmp-bar-hint${hint ? ' show' : ''}`}>{hint}</div>
      <div className="cmp-bar visible">
        <span className="cmp-bar-label">Comparing</span>
        <div className="cmp-bar-chips">
          {items.map((b) => (
            <span className="cmp-bar-chip" key={b.id}>
              <span>{b.name}</span>
              <button type="button" aria-label={`Remove ${b.name} from comparison`} onClick={() => remove(b.id)}>
                <i className="ti ti-x" />
              </button>
            </span>
          ))}
        </div>
        <button className="cmp-bar-clear" onClick={clear}>Clear</button>
        <button className="cmp-bar-cta" disabled={items.length < 2} onClick={openModal}>
          {items.length < 2 ? 'Add 1 more to compare' : `Compare Now (${items.length})`}
        </button>
      </div>

      {modalOpen && (
        <div className="cmp-modal-overlay visible" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="cmp-modal" role="dialog" aria-modal="true">
            <div className="cmp-modal-head">
              <h3>Compare Businesses</h3>
              <button className="cmp-modal-close" aria-label="Close comparison" onClick={closeModal}><i className="ti ti-x" /></button>
            </div>
            <div className="cmp-modal-body">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th />
                    {items.map((b) => (
                      <td key={b.id}>
                        <div className="cmp-col-name">
                          <span className="cmp-biz-name">{b.name}</span>
                          <button className="cmp-col-remove" onClick={() => { remove(b.id); if (items.length - 1 === 0) closeModal(); }}>Remove</button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const rawVals = items.map(row.get);
                    const winners = row.numeric && row.badge
                      ? highlightWinner(rawVals.map((v) => (v == null ? '' : v)), !!row.lowerIsBetter)
                      : rawVals.map(() => false);
                    return (
                      <tr key={row.label}>
                        <th>{row.label}</th>
                        {items.map((b, i) => {
                          const val = rawVals[i];
                          if (val == null || val === '') {
                            return <td key={b.id}><span className="cmp-not-available">Not Available</span></td>;
                          }
                          const isWinner = winners[i];
                          return (
                            <td key={b.id} className={isWinner ? 'cmp-winner' : ''}>
                              {String(val)}
                              {isWinner && <span className="cmp-winner-badge"><i className="ti ti-trophy" /> {row.badge}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="cmp-modal-footer">
                {items.map((b) => (
                  <button key={b.id} className="cmp-view-btn" onClick={() => navigate(`/business/${b.id}`)}>
                    {b.name} <i className="ti ti-arrow-right" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
