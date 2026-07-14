import { Watchlist } from '../../utils/watchlist';
import { Compare, COMPARE_MAX } from '../../utils/compare';

export function BookmarkButton({ id, refreshTick, onToggle }) {
  const saved = Watchlist.has(id);
  return (
    <button
      className={`bookmark-btn${saved ? ' saved' : ''}`}
      aria-label={saved ? 'Remove from saved' : 'Save this opportunity'}
      title={saved ? 'Remove from saved' : 'Save this opportunity'}
      onClick={(e) => {
        e.stopPropagation();
        Watchlist.toggle(id);
        onToggle?.();
      }}
    >
      <i className={`ti ${saved ? 'ti-bookmark-filled' : 'ti-bookmark'}`} />
    </button>
  );
}

export function CompareButton({ id, onToggle, onBlocked }) {
  const active = Compare.has(id);
  const atMax = !active && Compare.count() >= COMPARE_MAX;
  return (
    <button
      className={`cmp-toggle-btn${active ? ' active' : ''}${atMax ? ' full' : ''}`}
      aria-label={active ? 'Remove from comparison' : 'Add to comparison'}
      title={active ? 'Remove from comparison' : atMax ? 'Compare up to 3 at a time' : 'Add to comparison'}
      onClick={(e) => {
        e.stopPropagation();
        const result = Compare.toggle(id);
        if (result.blocked === 'max') {
          onBlocked?.('Compare up to 3 at a time — remove one to add another.');
          return;
        }
        onToggle?.();
      }}
    >
      <i className="ti ti-arrows-right-left" />
    </button>
  );
}
