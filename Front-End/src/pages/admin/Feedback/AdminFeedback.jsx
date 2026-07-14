import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as api from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import Button from '../../../components/Buttons/Button';
import { SkeletonBlock } from '../../../components/Loading/Skeleton';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { STATUS_CLASS, STATUS_DOT } from '../../../utils/feedbackShared';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminFeedback() {
  const toast = useToast();
  const [meta, setMeta] = useState(null);
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState(new Set());
  const [detailItem, setDetailItem] = useState(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [responseDraft, setResponseDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  async function load() {
    setItems(null);
    try {
      const rows = await api.adminListFeedback({
        q: debouncedQuery || undefined,
        category: category || undefined,
        status: status || undefined,
        sort,
      });
      setItems(rows);
      setSelected(new Set());
    } catch {
      toast.error('Could not load feedback — make sure you are signed in.');
      setItems([]);
    }
  }

  useEffect(() => {
    api.getFeedbackMeta().then(setMeta).catch(() => setMeta(null));
  }, []);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [debouncedQuery, category, status, sort]);

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (!items) return;
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((it) => it.id))));
  }

  function openDetail(item) {
    setDetailItem(item);
    setStatusDraft(item.status);
    setResponseDraft(item.admin_response || '');
  }

  async function saveStatus() {
    if (!detailItem) return;
    setSaving(true);
    try {
      await api.adminUpdateFeedbackStatus(detailItem.id, statusDraft, responseDraft.trim() || undefined);
      toast.success('Feedback updated.');
      setDetailItem(null);
      load();
    } catch {
      toast.error('Could not update feedback.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(item) {
    try {
      await api.adminPinFeedback(item.id, !item.is_pinned);
      toast.success(item.is_pinned ? 'Unpinned.' : 'Pinned — now always shown as trending.');
      load();
    } catch {
      toast.error('Could not update pin status.');
    }
  }

  async function doDelete(item) {
    try {
      await api.adminDeleteFeedback(item.id);
      toast.success('Feedback deleted.');
      setConfirmDelete(null);
      setDetailItem(null);
      load();
    } catch {
      toast.error('Could not delete feedback.');
    }
  }

  async function doBulkDelete() {
    try {
      const ids = Array.from(selected);
      const r = await api.adminBulkDeleteFeedback(ids);
      toast.success(`${r.ok} item${r.ok === 1 ? '' : 's'} deleted.`);
      setConfirmBulkDelete(false);
      load();
    } catch {
      toast.error('Bulk delete failed.');
    }
  }

  const statusOptions = useMemo(() => meta?.statuses || ['Under Review', 'Planned', 'In Progress', 'Released', 'Rejected'], [meta]);
  const categoryOptions = useMemo(() => meta?.categories || [], [meta]);

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Feedback Moderation</div>
          <div className="admin-page-sub">{items ? `${items.length} result${items.length === 1 ? '' : 's'}` : 'Loading…'}</div>
        </div>
        {selected.size > 0 && (
          <Button variant="danger" icon="ti-trash" onClick={() => setConfirmBulkDelete(true)}>
            Delete {selected.size} selected
          </Button>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <i className="ti ti-search" />
            <input type="text" placeholder="Search subject, message, name, email…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}>
            <option value="">All categories</option>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}>
            <option value="">All statuses</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}>
            <option value="newest">Newest</option>
            <option value="popular">Most Voted</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>

        {items === null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2, 3, 4].map((i) => <SkeletonBlock key={i} height={40} />)}
          </div>
        )}

        {items?.length === 0 && <div className="admin-empty">No feedback matches these filters.</div>}

        {items && items.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selected.size === items.length} onChange={toggleSelectAll} /></th>
                  <th>Subject</th><th>Category</th><th>Status</th><th>Votes</th><th>Date</th><th />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} />
                    </td>
                    <td style={{ cursor: 'pointer', maxWidth: 320 }} onClick={() => openDetail(item)}>
                      <strong>{item.subject}</strong>{item.is_pinned && <span title="Pinned"> 📌</span>}
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.name}{item.business_name ? ` · ${item.business_name}` : ''}</div>
                    </td>
                    <td>{item.category}</td>
                    <td><span className={`fb-sbadge ${STATUS_CLASS[item.status] || 's-under-review'}`} style={{ fontSize: 11 }}>{STATUS_DOT[item.status] || '⚪'} {item.status}</span></td>
                    <td>{item.vote_count}</td>
                    <td style={{ color: 'var(--muted)' }}>{fmtDate(item.created_at)}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-icon-btn" title={item.is_pinned ? 'Unpin' : 'Pin'} onClick={() => togglePin(item)}>
                          <i className={`ti ${item.is_pinned ? 'ti-pinned-off' : 'ti-pin'}`} />
                        </button>
                        <button className="admin-icon-btn" title="View / Edit" onClick={() => openDetail(item)}><i className="ti ti-edit" /></button>
                        <button className="admin-icon-btn danger" title="Delete" onClick={() => setConfirmDelete(item)}><i className="ti ti-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {detailItem && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) setDetailItem(null); }}>
            <motion.div className="admin-modal" style={{ maxWidth: 520 }} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}>
              <div className="admin-modal-head">
                <span className="admin-modal-title">{detailItem.subject}</span>
                <button className="admin-modal-close" onClick={() => setDetailItem(null)}><i className="ti ti-x" /></button>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
                {detailItem.name} · {detailItem.email || 'anonymous'} · {fmtDate(detailItem.created_at)}
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-wrap' }}>{detailItem.message}</p>

              <div className="admin-field">
                <label>Status</label>
                <select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Admin response (optional, visible to the reporter)</label>
                <textarea rows={3} value={responseDraft} onChange={(e) => setResponseDraft(e.target.value)} placeholder="e.g. Thanks — we've added this to the roadmap!" />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(detailItem)}>Delete</Button>
                <Button variant="primary" style={{ flex: 2 }} loading={saving} onClick={saveStatus}>Save Changes</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
            <motion.div className="admin-modal" style={{ maxWidth: 360 }} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}>
              <div className="admin-modal-head"><span className="admin-modal-title">Delete Feedback</span></div>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 18 }}>
                Delete <strong style={{ color: 'var(--text)' }}>"{confirmDelete.subject}"</strong>? This can't be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="danger" style={{ flex: 1 }} onClick={() => doDelete(confirmDelete)}>Delete</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmBulkDelete && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) setConfirmBulkDelete(false); }}>
            <motion.div className="admin-modal" style={{ maxWidth: 360 }} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}>
              <div className="admin-modal-head"><span className="admin-modal-title">Delete {selected.size} items</span></div>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 18 }}>This can't be undone. Continue?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" style={{ flex: 1 }} onClick={() => setConfirmBulkDelete(false)}>Cancel</Button>
                <Button variant="danger" style={{ flex: 1 }} onClick={doBulkDelete}>Delete All</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
