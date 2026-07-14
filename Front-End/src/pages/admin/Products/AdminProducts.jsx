import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as api from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import Button from '../../../components/Buttons/Button';
import { SkeletonBlock } from '../../../components/Loading/Skeleton';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { fmtIndian } from '../../../utils/bizFormat';

export default function AdminProducts() {
  const toast = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 200);
  const [businessFilter, setBusinessFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function load() {
    try {
      const [prods, bizs] = await Promise.all([api.adminGetProducts(), api.adminGetBusinesses()]);
      setProducts(prods);
      setBusinesses(bizs);
    } catch {
      toast.error('Could not load products.');
      setProducts([]);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = debouncedQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (businessFilter && String(p.business_id) !== String(businessFilter)) return false;
      if (!q) return true;
      return (p.name || '').toLowerCase().includes(q) || (p.business_name || '').toLowerCase().includes(q);
    });
  }, [products, debouncedQuery, businessFilter]);

  async function toggleHidden(prod) {
    try {
      if (prod.is_hidden) { await api.adminUnhideProduct(prod.id); toast.success(`"${prod.name}" is now visible.`); }
      else { await api.adminHideProduct(prod.id); toast.success(`"${prod.name}" hidden from the public site.`); }
      load();
    } catch {
      toast.error('Could not update visibility.');
    }
  }

  async function doDelete(prod) {
    try {
      await api.adminDeleteProduct(prod.id);
      toast.success(`"${prod.name}" deleted.`);
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Could not delete product.');
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Products</div>
          <div className="admin-page-sub">{products ? `${products.length} total` : 'Loading…'}</div>
        </div>
        <Button variant="primary" icon="ti-plus" onClick={() => navigate('/admin/products/new')}>Add Product</Button>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <i className="ti ti-search" />
            <input type="text" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select value={businessFilter} onChange={(e) => setBusinessFilter(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}>
            <option value="">All businesses</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {products === null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2, 3, 4].map((i) => <SkeletonBlock key={i} height={40} />)}
          </div>
        )}

        {products !== null && filtered.length === 0 && <div className="admin-empty">No products found.</div>}

        {filtered.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Parent Business</th><th>Market Size</th><th>Investment</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filtered.map((prod) => (
                  <tr key={prod.id} className={prod.is_hidden ? 'admin-row-hidden' : ''}>
                    <td><strong>{prod.name}</strong></td>
                    <td style={{ color: 'var(--muted)' }}>{prod.business_name || '—'}</td>
                    <td>{fmtIndian(prod.market_size) || '—'}</td>
                    <td>{prod.investment || '—'}</td>
                    <td>
                      <span className={`admin-badge ${prod.is_hidden ? 'admin-badge-hidden' : 'admin-badge-visible'}`}>
                        {prod.is_hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-icon-btn" title="Edit" onClick={() => navigate(`/admin/products/${prod.id}/edit`)}><i className="ti ti-edit" /></button>
                        <button className="admin-icon-btn" title="View on site" onClick={() => window.open(`/product/${prod.id}`, '_blank')}><i className="ti ti-external-link" /></button>
                        <button className="admin-icon-btn" title={prod.is_hidden ? 'Unhide' : 'Hide'} onClick={() => toggleHidden(prod)}>
                          <i className={`ti ${prod.is_hidden ? 'ti-eye' : 'ti-eye-off'}`} />
                        </button>
                        <button className="admin-icon-btn danger" title="Delete" onClick={() => setConfirmDelete(prod)}><i className="ti ti-trash" /></button>
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
              <div className="admin-modal-head"><span className="admin-modal-title">Delete Product</span></div>
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
