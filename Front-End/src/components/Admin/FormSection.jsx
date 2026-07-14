import { useState } from 'react';

export default function FormSection({ title, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="admin-card" style={{ marginBottom: 14 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <span className="admin-card-title"><i className={`ti ${icon}`} style={{ marginRight: 8, color: '#4f46e5' }} />{title}</span>
        <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ color: 'var(--muted)' }} />
      </button>
      {open && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}
