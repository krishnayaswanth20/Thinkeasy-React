import { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

function Row({ children, onSave, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', gap: 8 }}>{children}</div>
      <button type="button" className="admin-icon-btn" title="Save" onClick={onSave}><i className="ti ti-device-floppy" /></button>
      <button type="button" className="admin-icon-btn danger" title="Delete" onClick={onDelete}><i className="ti ti-trash" /></button>
    </div>
  );
}

const inputStyle = { flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 };

export default function SourcesSchemesManager({ businessId }) {
  const toast = useToast();
  const [sources, setSources] = useState(null);
  const [schemes, setSchemes] = useState(null);
  const [newSource, setNewSource] = useState({ source_name: '', source_url: '' });
  const [newScheme, setNewScheme] = useState({ scheme_name: '', description: '', official_url: '' });

  async function loadAll() {
    try {
      const [s, g] = await Promise.all([api.getBusinessSources(businessId), api.getGovernmentSchemes(businessId)]);
      setSources(s);
      setSchemes(g);
    } catch {
      toast.error('Could not load sources/schemes.');
    }
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [businessId]);

  async function saveSource(row) {
    try {
      if (row.id) await api.updateBusinessSource(businessId, row.id, row);
      else await api.addBusinessSource(businessId, row);
      toast.success('Source saved.');
      loadAll();
    } catch {
      toast.error('Could not save source — name and URL are required.');
    }
  }
  async function deleteSource(row) {
    if (!row.id) { setSources((list) => list.filter((r) => r !== row)); return; }
    try { await api.deleteBusinessSource(businessId, row.id); toast.success('Source removed.'); loadAll(); } catch { toast.error('Could not delete source.'); }
  }

  async function saveScheme(row) {
    try {
      if (row.id) await api.updateGovernmentScheme(businessId, row.id, row);
      else await api.addGovernmentScheme(businessId, row);
      toast.success('Scheme saved.');
      loadAll();
    } catch {
      toast.error('Could not save scheme — name is required.');
    }
  }
  async function deleteScheme(row) {
    if (!row.id) { setSchemes((list) => list.filter((r) => r !== row)); return; }
    try { await api.deleteGovernmentScheme(businessId, row.id); toast.success('Scheme removed.'); loadAll(); } catch { toast.error('Could not delete scheme.'); }
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Business Sources</div>
      {sources === null && <div className="admin-field-hint">Loading…</div>}
      {sources?.map((row, i) => (
        <Row key={row.id || `new-${i}`} onSave={() => saveSource(row)} onDelete={() => deleteSource(row)}>
          <input style={inputStyle} placeholder="Source name" value={row.source_name || ''} onChange={(e) => setSources((list) => list.map((r, j) => (j === i ? { ...r, source_name: e.target.value } : r)))} />
          <input style={inputStyle} placeholder="https://…" value={row.source_url || ''} onChange={(e) => setSources((list) => list.map((r, j) => (j === i ? { ...r, source_url: e.target.value } : r)))} />
        </Row>
      ))}
      <Row
        onSave={() => { if (newSource.source_name && newSource.source_url) { saveSource(newSource); setNewSource({ source_name: '', source_url: '' }); } else toast.error('Name and URL are required.'); }}
        onDelete={() => setNewSource({ source_name: '', source_url: '' })}
      >
        <input style={inputStyle} placeholder="New source name" value={newSource.source_name} onChange={(e) => setNewSource((s) => ({ ...s, source_name: e.target.value }))} />
        <input style={inputStyle} placeholder="https://…" value={newSource.source_url} onChange={(e) => setNewSource((s) => ({ ...s, source_url: e.target.value }))} />
      </Row>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '18px 0 8px' }}>Government Schemes</div>
      {schemes === null && <div className="admin-field-hint">Loading…</div>}
      {schemes?.map((row, i) => (
        <Row key={row.id || `new-${i}`} onSave={() => saveScheme(row)} onDelete={() => deleteScheme(row)}>
          <input style={inputStyle} placeholder="Scheme name" value={row.scheme_name || ''} onChange={(e) => setSchemes((list) => list.map((r, j) => (j === i ? { ...r, scheme_name: e.target.value } : r)))} />
          <input style={inputStyle} placeholder="Description" value={row.description || ''} onChange={(e) => setSchemes((list) => list.map((r, j) => (j === i ? { ...r, description: e.target.value } : r)))} />
          <input style={inputStyle} placeholder="https://…" value={row.official_url || ''} onChange={(e) => setSchemes((list) => list.map((r, j) => (j === i ? { ...r, official_url: e.target.value } : r)))} />
        </Row>
      ))}
      <Row
        onSave={() => { if (newScheme.scheme_name) { saveScheme(newScheme); setNewScheme({ scheme_name: '', description: '', official_url: '' }); } else toast.error('Scheme name is required.'); }}
        onDelete={() => setNewScheme({ scheme_name: '', description: '', official_url: '' })}
      >
        <input style={inputStyle} placeholder="New scheme name" value={newScheme.scheme_name} onChange={(e) => setNewScheme((s) => ({ ...s, scheme_name: e.target.value }))} />
        <input style={inputStyle} placeholder="Description" value={newScheme.description} onChange={(e) => setNewScheme((s) => ({ ...s, description: e.target.value }))} />
        <input style={inputStyle} placeholder="https://…" value={newScheme.official_url} onChange={(e) => setNewScheme((s) => ({ ...s, official_url: e.target.value }))} />
      </Row>
    </div>
  );
}
