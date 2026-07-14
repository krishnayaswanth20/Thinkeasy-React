import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as api from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import Button from '../../../components/Buttons/Button';

const ENTITIES = [
  { key: 'categories', label: 'Categories', icon: 'ti-category' },
  { key: 'businesses', label: 'Businesses', icon: 'ti-building-store' },
  { key: 'products', label: 'Products', icon: 'ti-package' },
];

const STATUS_STYLE = {
  valid: { bg: 'rgba(16,185,129,.12)', color: '#10b981', label: 'Will Import' },
  duplicate: { bg: 'rgba(245,158,11,.12)', color: '#f59e0b', label: 'Duplicate' },
  invalid: { bg: 'rgba(239,68,68,.12)', color: '#ef4444', label: 'Invalid' },
  imported: { bg: 'rgba(16,185,129,.12)', color: '#10b981', label: 'Imported' },
  updated: { bg: 'rgba(37,99,235,.12)', color: '#2563eb', label: 'Updated' },
  skipped: { bg: 'rgba(148,163,184,.15)', color: 'var(--muted)', label: 'Skipped' },
  failed: { bg: 'rgba(239,68,68,.12)', color: '#ef4444', label: 'Failed' },
};

function StatusChip({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.skipped;
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function AdminImportWizard() {
  const toast = useToast();
  const { push } = useNotifications();
  const fileInputRef = useRef(null);
  const [entity, setEntity] = useState('categories');
  const [file, setFile] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  function chooseEntity(key) {
    setEntity(key);
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function downloadTemplate() {
    setDownloading(true);
    try {
      const blob = await api.downloadImportTemplate(entity);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity}_import_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download the template.');
    } finally {
      setDownloading(false);
    }
  }

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setResult(null);
    setPreview(null);
    if (!f) { setFile(null); return; }
    if (!/\.xlsx?$/i.test(f.name)) {
      toast.error('Only .xlsx / .xls files are accepted.');
      e.target.value = '';
      return;
    }
    setFile(f);
  }

  async function runPreview() {
    if (!file) return toast.error('Choose a file first.');
    setPreviewing(true);
    setPreview(null);
    try {
      const data = await api.previewImport(entity, file);
      setPreview(data);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not preview this file.');
    } finally {
      setPreviewing(false);
    }
  }

  async function confirmImport() {
    if (!file) return;
    setImporting(true);
    try {
      const data = await api.commitImport(entity, file);
      setResult(data);
      toast.success(data.message || 'Import complete.');
      push({ type: 'import', title: 'Import completed', body: `${entity}: ${data.message || 'done'}` });
      setPreview(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  function rowColumns(rows) {
    if (!rows || rows.length === 0) return [];
    return Object.keys(rows[0]).filter((k) => k !== 'status' && k !== 'reason');
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Import Wizard</div>
          <div className="admin-page-sub">Bulk-add categories, businesses, or products from an Excel file.</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title" style={{ marginBottom: 14 }}>1. Choose what to import</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
          {ENTITIES.map((e) => (
            <button
              key={e.key}
              type="button"
              onClick={() => chooseEntity(e.key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '16px 10px', borderRadius: 12, cursor: 'pointer',
                border: entity === e.key ? '2px solid #4f46e5' : '1.5px solid var(--border)',
                background: entity === e.key ? 'rgba(79,70,229,.06)' : 'var(--bg)',
                color: entity === e.key ? '#4f46e5' : 'var(--text)',
              }}
            >
              <i className={`ti ${e.icon}`} style={{ fontSize: 22 }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title" style={{ marginBottom: 14 }}>2. Download the template</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          Start from the official template so column names match exactly — required columns are marked inside the sheet.
        </p>
        <Button variant="ghost" icon="ti-download" loading={downloading} onClick={downloadTemplate}>
          Download {ENTITIES.find((e) => e.key === entity)?.label} Template
        </Button>
      </div>

      <div className="admin-card">
        <div className="admin-card-title" style={{ marginBottom: 14 }}>3. Upload &amp; preview</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={onFileChange} style={{ fontSize: 13 }} />
          <Button variant="primary" size="sm" icon="ti-eye" loading={previewing} disabled={!file} onClick={runPreview}>
            Preview
          </Button>
        </div>
        {file && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Selected: {file.name}</div>}
      </div>

      {preview && (
        <motion.div className="admin-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="admin-card-head">
            <span className="admin-card-title">Preview — {preview.total_rows} row{preview.total_rows === 1 ? '' : 's'} found</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {Object.entries(preview.counts || {}).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <StatusChip status={k} /> <strong style={{ color: 'var(--text)' }}>{v}</strong>
              </div>
            ))}
          </div>
          {preview.rows?.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    {rowColumns(preview.rows).map((k) => <th key={k}>{k}</th>)}
                    <th>Status</th><th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i}>
                      {rowColumns(preview.rows).map((k) => <td key={k}>{String(row[k] ?? '—')}</td>)}
                      <td><StatusChip status={row.status} /></td>
                      <td style={{ color: 'var(--muted)', fontSize: 12.5 }}>{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>
            Showing the first {preview.preview_limit} of {preview.total_rows} rows.
          </div>
          <div style={{ marginTop: 16 }}>
            <Button variant="primary" icon="ti-check" loading={importing} onClick={confirmImport}>
              Confirm Import
            </Button>
          </div>
        </motion.div>
      )}

      {result && (
        <motion.div className="admin-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="admin-card-title" style={{ marginBottom: 14 }}>Import Complete</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {Object.entries(result.summary || {}).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <StatusChip status={k} /> <strong style={{ color: 'var(--text)' }}>{v}</strong>
              </div>
            ))}
          </div>
          {result.rows?.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Status</th><th>Reason</th></tr></thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      <td>{row.name}</td>
                      <td><StatusChip status={row.status} /></td>
                      <td style={{ color: 'var(--muted)', fontSize: 12.5 }}>{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
