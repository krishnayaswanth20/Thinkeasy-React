import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as api from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import Button from '../../../components/Buttons/Button';
import { SkeletonBlock } from '../../../components/Loading/Skeleton';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { fmtIndian } from '../../../utils/bizFormat';

export default function AdminBusinesses() {
  const toast = useToast();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState(null);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 200);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function load() {
    try {
      const [bizs, cats] = await Promise.all([api.adminGetBusinesses(), api.adminGetCategories()]);
      setBusinesses(bizs);
      setCategories(cats);
    } catch {
      toast.error('Could not load businesses.');
      setBusinesses([]);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filtered = useMemo(() => {
    if (!businesses) return [];
    const q = debouncedQuery.trim().toLowerCase();
    return businesses.filter((b) => {
      if (categoryFilter && String(b.category_id) !== String(categoryFilter)) return false;
      if (!q) return true;
      return (b.name || '').toLowerCase().includes(q) || (b.category_name || '').toLowerCase().includes(q);
    });
  }, [businesses, debouncedQuery, categoryFilter]);

  async function toggleHidden(biz) {
    try {
      if (biz.is_hidden) { await api.adminUnhideBusiness(biz.id); toast.success(`"${biz.name}" is now visible.`); }
      else { await api.adminHideBusiness(biz.id); toast.success(`"${biz.name}" hidden from the public site.`); }
      load();
    } catch {
      toast.error('Could not update visibility.');
    }
  }

  async function doDelete(biz) {
    try {
      await api.adminDeleteBusiness(biz.id);
      toast.success(`"${biz.name}" deleted.`);
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Could not delete business.');
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Businesses</div>
          <div className="admin-page-sub">{businesses ? `${businesses.length} total` : 'Loading…'}</div>
        </div>
        <Button variant="primary" icon="ti-plus" onClick={() => navigate('/admin/businesses/new')}>Add Business</Button>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <i className="ti ti-search" />
            <input type="text" placeholder="Search businesses…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {businesses === null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2, 3, 4].map((i) => <SkeletonBlock key={i} height={40} />)}
          </div>
        )}

        {businesses !== null && filtered.length === 0 && <div className="admin-empty">No businesses found.</div>}

        {filtered.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Category</th><th>Market Size</th><th>Investment</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filtered.map((biz) => (
                  <tr key={biz.id} className={biz.is_hidden ? 'admin-row-hidden' : ''}>
                    <td><strong>{biz.name}</strong></td>
                    <td style={{ color: 'var(--muted)' }}>{biz.category_name || '—'}</td>
                    <td>{fmtIndian(biz.market_size) || '—'}</td>
                    <td>{biz.investment || '—'}</td>
                    <td>
                      <span className={`admin-badge ${biz.is_hidden ? 'admin-badge-hidden' : 'admin-badge-visible'}`}>
                        {biz.is_hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-icon-btn" title="Edit" onClick={() => navigate(`/admin/businesses/${biz.id}/edit`)}><i className="ti ti-edit" /></button>
                        <button className="admin-icon-btn" title="View on site" onClick={() => window.open(`/business/${biz.id}`, '_blank')}><i className="ti ti-external-link" /></button>
                        <button className="admin-icon-btn" title={biz.is_hidden ? 'Unhide' : 'Hide'} onClick={() => toggleHidden(biz)}>
                          <i className={`ti ${biz.is_hidden ? 'ti-eye' : 'ti-eye-off'}`} />
                        </button>
                        <button className="admin-icon-btn danger" title="Delete" onClick={() => setConfirmDelete(biz)}><i className="ti ti-trash" /></button>
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
        {confirmDelete && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
            <motion.div className="admin-modal" style={{ maxWidth: 360 }} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}>
              <div className="admin-modal-head"><span className="admin-modal-title">Delete Business</span></div>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 18 }}>
                Delete <strong style={{ color: 'var(--text)' }}>"{confirmDelete.name}"</strong>? This can't be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="danger" style={{ flex: 1 }} onClick={() => doDelete(confirmDelete)}>Delete</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
