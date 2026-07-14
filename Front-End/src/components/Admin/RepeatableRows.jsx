import Button from '../Buttons/Button';

// Generic editor for an array-of-objects field (e.g. suppliers, roadmap
// steps, growth-chart year rows). `fields` describes each column:
// { key, placeholder, type: 'text'|'number', width }
export default function RepeatableRows({ items, onChange, fields, addLabel = 'Add row', emptyRow }) {
  function update(index, key, value) {
    const next = items.slice();
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function remove(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...items, { ...emptyRow }]);
  }

  return (
    <div>
      {items.length === 0 && <div className="admin-field-hint" style={{ marginBottom: 8 }}>No entries yet.</div>}
      {items.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          {fields.map((f) => (
            <input
              key={f.key}
              type={f.type === 'number' ? 'text' : 'text'}
              inputMode={f.type === 'number' ? 'numeric' : undefined}
              placeholder={f.placeholder}
              value={row[f.key] ?? ''}
              onChange={(e) => {
                const v = f.type === 'number' ? e.target.value.replace(/[^0-9.\-]/g, '') : e.target.value;
                update(i, f.key, v);
              }}
              style={{
                flex: f.width || 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text)', fontSize: 13,
              }}
            />
          ))}
          <button type="button" className="admin-icon-btn danger" onClick={() => remove(i)} aria-label="Remove row">
            <i className="ti ti-x" />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" icon="ti-plus" onClick={add}>{addLabel}</Button>
    </div>
  );
}
