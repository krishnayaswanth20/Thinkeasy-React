import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as api from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import Button from '../../../components/Buttons/Button';
import { SkeletonBlock } from '../../../components/Loading/Skeleton';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';

const EMPTY_FORM = { id: null, name: '', slug: '', icon: '', parent_id: '' };

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 200);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // category being confirmed for delete

  async function load() {
    try {
      const rows = await api.adminGetCategories();
      setCategories(rows);
    } catch {
      toast.error('Could not load categories.');
      setCategories([]);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filtered = useMemo(() => {
    if (!categories) return [];
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => (c.name || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q));
  }, [categories, debouncedQuery]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setModalOpen(true);
  }

  function openEdit(cat) {
    setForm({ id: cat.id, name: cat.name || '', slug: cat.slug || '', icon: cat.icon || '', parent_id: cat.parent_id || '' });
    setSlugTouched(true);
    setModalOpen(true);
  }

  function onNameChange(name) {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Category name is required.');
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), slug: form.slug.trim() || slugify(form.name), icon: form.icon.trim() || null, parent_id: form.parent_id || null };
      if (form.id) {
        await api.adminUpdateCategory(form.id, payload);
        toast.success('Category updated.');
      } else {
        await api.adminAddCategory(payload);
        toast.success('Category added.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not save category.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleHidden(cat) {
    try {
      if (cat.is_hidden) {
        await api.adminUnhideCategory(cat.id);
        toast.success(`"${cat.name}" is now visible.`);
      } else {
        await api.adminHideCategory(cat.id);
        toast.success(`"${cat.name}" hidden from the public site.`);
      }
      load();
    } catch {
      toast.error('Could not update visibility.');
    }
  }

  async function doDelete(cat) {
    try {
      await api.adminDeleteCategory(cat.id);
      toast.success(`"${cat.name}" deleted.`);
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Could not delete category.');
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Categories</div>
          <div className="admin-page-sub">{categories ? `${categories.length} total` : 'Loading…'}</div>
        </div>
        <Button variant="primary" icon="ti-plus" onClick={openAdd}>Add Category</Button>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <i className="ti ti-search" />
            <input type="text" placeholder="Search categories…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {categories === null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2, 3].map((i) => <SkeletonBlock key={i} height={38} />)}
          </div>
        )}

        {categories !== null && filtered.length === 0 && (
          <div className="admin-empty">No categories found.</div>
        )}

        {filtered.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Slug</th><th>Icon</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <tr key={cat.id} className={cat.is_hidden ? 'admin-row-hidden' : ''}>
                    <td><strong>{cat.name}</strong></td>
                    <td style={{ color: 'var(--muted)' }}>{cat.slug}</td>
                    <td>{cat.icon || '—'}</td>
                    <td>
                      <span className={`admin-badge ${cat.is_hidden ? 'admin-badge-hidden' : 'admin-badge-visible'}`}>
                        {cat.is_hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-icon-btn" title="Edit" onClick={() => openEdit(cat)}><i className="ti ti-edit" /></button>
                        <button className="admin-icon-btn" title={cat.is_hidden ? 'Unhide' : 'Hide'} onClick={() => toggleHidden(cat)}>
                          <i className={`ti ${cat.is_hidden ? 'ti-eye' : 'ti-eye-off'}`} />
                        </button>
                        <button className="admin-icon-btn danger" title="Delete" onClick={() => setConfirmDelete(cat)}><i className="ti ti-trash" /></button>
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
        {modalOpen && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
            <motion.div className="admin-modal" initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}>
              <div className="admin-modal-head">
                <span className="admin-modal-title">{form.id ? 'Edit Category' : 'Add Category'}</span>
                <button className="admin-modal-close" onClick={() => setModalOpen(false)}><i className="ti ti-x" /></button>
              </div>
              <form onSubmit={submit}>
                <div className="admin-field">
                  <label>Name *</label>
                  <input type="text" value={form.name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Food & Beverage" />
                </div>
                <div className="admin-field">
                  <label>Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: e.target.value })); }} placeholder="food-beverage" />
                  <div className="admin-field-hint">Auto-generated from the name — edit if you need a custom URL slug.</div>
                </div>
                <div className="admin-field">
                  <label>Icon (emoji or icon name)</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🍔" />
                </div>
                <Button type="submit" variant="primary" loading={saving} style={{ width: '100%', marginTop: 6 }}>
                  {form.id ? 'Save Changes' : 'Add Category'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
            <motion.div className="admin-modal" style={{ maxWidth: 360 }} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}>
              <div className="admin-modal-head"><span className="admin-modal-title">Delete Category</span></div>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 18 }}>
                Delete <strong style={{ color: 'var(--text)' }}>"{confirmDelete.name}"</strong>? Businesses under it will be uncategorized — this can't be undone.
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
