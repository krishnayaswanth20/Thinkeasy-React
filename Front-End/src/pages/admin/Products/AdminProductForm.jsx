import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import Button from '../../../components/Buttons/Button';
import FormSection from '../../../components/Admin/FormSection';
import RepeatableRows from '../../../components/Admin/RepeatableRows';

const EMPTY = {
  name: '', business_id: '', category_id: '', market_size: '', growth_rate: '', investment: '',
  min_investment: '', max_investment: '', profit_margin: '',
  breakeven: '', breakeven_value: '', breakeven_unit: 'Months',
  overview: '', is_hidden: false,
  badges: [], roadmap: [], suppliers: [], competitors: [],
  growthChartRows: [], investmentChartRows: [], profitProjection: [],
};

const THREAT_OPTIONS = ['Low', 'Medium', 'High'];

function safeParse(v, fallback) {
  if (!v) return fallback;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fallback; }
}

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [businesses, setBusinesses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.adminGetBusinesses().then(setBusinesses).catch(() => setBusinesses([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const prod = await api.adminGetProduct(id);
        if (cancelled) return;
        const gc = safeParse(prod.growth_chart, {});
        const ic = safeParse(prod.investment_chart, {});
        const pp = safeParse(prod.profit_projection, []);
        setForm({
          name: prod.name || '', business_id: prod.business_id || '', category_id: prod.category_id || '',
          market_size: prod.market_size || '', growth_rate: prod.growth_rate || '', investment: prod.investment || '',
          min_investment: prod.min_investment || '', max_investment: prod.max_investment || '',
          profit_margin: prod.profit_margin || '',
          breakeven: prod.breakeven || '', breakeven_value: prod.breakeven_value || '', breakeven_unit: prod.breakeven_unit || 'Months',
          overview: prod.overview || '', is_hidden: !!prod.is_hidden,
          badges: safeParse(prod.badges, []),
          roadmap: safeParse(prod.roadmap, []),
          suppliers: safeParse(prod.suppliers, []),
          competitors: safeParse(prod.competitors, []),
          growthChartRows: (gc.labels || []).map((l, i) => ({ label: l, value: String((gc.values || gc.data || [])[i] ?? '') })),
          investmentChartRows: (ic.labels || []).map((l, i) => ({ label: l, value: String((ic.values || ic.data || [])[i] ?? '') })),
          profitProjection: Array.isArray(pp) ? pp.map((v) => ({ value: String(v) })) : [],
        });
      } catch {
        toast.error('Could not load this product.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Product name is required.');
    if (!form.business_id) return toast.error('Choose the parent business.');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        business_id: form.business_id,
        category_id: form.category_id || null,
        market_size: form.market_size || null,
        growth_rate: form.growth_rate || null,
        investment: form.investment || null,
        min_investment: form.min_investment || null,
        max_investment: form.max_investment || null,
        profit_margin: form.profit_margin || null,
        breakeven: form.breakeven || null,
        breakeven_value: form.breakeven_value || null,
        breakeven_unit: form.breakeven_unit || null,
        overview: form.overview || null,
        is_hidden: form.is_hidden,
        badges: form.badges.filter((b) => b.label),
        roadmap: form.roadmap.filter((r) => r.title || r.phase),
        suppliers: form.suppliers.filter((s) => s.name),
        competitors: form.competitors.filter((c) => c.name),
        growth_chart: {
          labels: form.growthChartRows.map((r) => r.label).filter(Boolean),
          values: form.growthChartRows.filter((r) => r.label).map((r) => parseFloat(r.value) || 0),
        },
        investment_chart: {
          labels: form.investmentChartRows.map((r) => r.label).filter(Boolean),
          values: form.investmentChartRows.filter((r) => r.label).map((r) => parseFloat(r.value) || 0),
        },
        profit_projection: form.profitProjection.map((r) => parseFloat(r.value) || 0),
      };

      if (isEdit) {
        await api.adminUpdateProduct(id, payload);
        toast.success('Product updated.');
      } else {
        const res = await api.adminAddProduct(payload);
        toast.success('Product created.');
        navigate(`/admin/products/${res.id}/edit`, { replace: true });
        return;
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-empty">Loading product…</div>;

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">{isEdit ? `Edit: ${form.name}` : 'Add Product'}</div>
          <div className="admin-page-sub">All fields feed the public Product Details page directly.</div>
        </div>
        <Button variant="ghost" icon="ti-arrow-left" onClick={() => navigate('/admin/products')}>Back to list</Button>
      </div>

      <form onSubmit={submit}>
        <FormSection title="Basic Info" icon="ti-info-circle" defaultOpen>
          <div className="admin-field">
            <label>Name *</label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Solar Panel Kit" />
          </div>
          <div className="admin-field">
            <label>Parent Business *</label>
            <select value={form.business_id} onChange={(e) => set('business_id', e.target.value)}>
              <option value="">— Choose a business —</option>
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="admin-field-hint">The product's category is inherited from this business unless a category is set explicitly server-side.</div>
          </div>
          <div className="admin-toggle-row">
            <span style={{ fontSize: 13, color: 'var(--text)' }}>Hidden from public site</span>
            <input type="checkbox" checked={form.is_hidden} onChange={(e) => set('is_hidden', e.target.checked)} />
          </div>
        </FormSection>

        <FormSection title="Financials" icon="ti-report-money" defaultOpen>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="admin-field">
              <label>Market Size (₹, raw number)</label>
              <input type="text" inputMode="numeric" value={form.market_size} onChange={(e) => set('market_size', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="5000000" />
            </div>
            <div className="admin-field">
              <label>Growth Rate</label>
              <input type="text" value={form.growth_rate} onChange={(e) => set('growth_rate', e.target.value)} placeholder="14%" />
            </div>
            <div className="admin-field">
              <label>Investment (display text)</label>
              <input type="text" value={form.investment} onChange={(e) => set('investment', e.target.value)} placeholder="₹50,000 – ₹1L" />
            </div>
            <div className="admin-field">
              <label>Profit Margin</label>
              <input type="text" value={form.profit_margin} onChange={(e) => set('profit_margin', e.target.value)} placeholder="20%" />
            </div>
            <div className="admin-field">
              <label>Min Investment (₹)</label>
              <input type="text" inputMode="numeric" value={form.min_investment} onChange={(e) => set('min_investment', e.target.value.replace(/[^0-9.]/g, ''))} />
            </div>
            <div className="admin-field">
              <label>Max Investment (₹)</label>
              <input type="text" inputMode="numeric" value={form.max_investment} onChange={(e) => set('max_investment', e.target.value.replace(/[^0-9.]/g, ''))} />
            </div>
            <div className="admin-field">
              <label>Breakeven Value</label>
              <input type="text" inputMode="numeric" value={form.breakeven_value} onChange={(e) => set('breakeven_value', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="6" />
            </div>
            <div className="admin-field">
              <label>Breakeven Unit</label>
              <input type="text" value={form.breakeven_unit} onChange={(e) => set('breakeven_unit', e.target.value)} placeholder="Months" />
            </div>
          </div>
        </FormSection>

        <FormSection title="Overview" icon="ti-file-description">
          <textarea rows={4} value={form.overview} onChange={(e) => set('overview', e.target.value)} placeholder="Product description shown on the details page…" style={{ width: '100%' }} />
        </FormSection>

        <FormSection title="Highlight Badges" icon="ti-star">
          <RepeatableRows
            items={form.badges}
            onChange={(v) => set('badges', v)}
            fields={[{ key: 'label', placeholder: 'e.g. Best Seller' }]}
            emptyRow={{ label: '' }}
            addLabel="Add badge"
          />
        </FormSection>

        <FormSection title="Market Growth Chart (year → value)" icon="ti-chart-line">
          <RepeatableRows
            items={form.growthChartRows}
            onChange={(v) => set('growthChartRows', v)}
            fields={[
              { key: 'label', placeholder: '2025', width: 1 },
              { key: 'value', placeholder: 'value e.g. 1200', type: 'number', width: 2 },
            ]}
            emptyRow={{ label: '', value: '' }}
            addLabel="Add year"
          />
        </FormSection>

        <FormSection title="Investment Breakdown (% of capital)" icon="ti-chart-donut">
          <RepeatableRows
            items={form.investmentChartRows}
            onChange={(v) => set('investmentChartRows', v)}
            fields={[
              { key: 'label', placeholder: 'e.g. Raw Materials', width: 2 },
              { key: 'value', placeholder: '%', type: 'number', width: 1 },
            ]}
            emptyRow={{ label: '', value: '' }}
            addLabel="Add allocation"
          />
        </FormSection>

        <FormSection title="Profit Projection (per year)" icon="ti-chart-bar">
          <RepeatableRows
            items={form.profitProjection}
            onChange={(v) => set('profitProjection', v)}
            fields={[{ key: 'value', placeholder: 'e.g. 2.5 (₹ Lakh)', type: 'number' }]}
            emptyRow={{ value: '' }}
            addLabel="Add year"
          />
        </FormSection>

        <FormSection title="Roadmap" icon="ti-route">
          <RepeatableRows
            items={form.roadmap}
            onChange={(v) => set('roadmap', v)}
            fields={[
              { key: 'phase', placeholder: 'Phase 1', width: 1 },
              { key: 'title', placeholder: 'Title', width: 2 },
              { key: 'desc', placeholder: 'Description', width: 3 },
            ]}
            emptyRow={{ phase: '', title: '', desc: '' }}
            addLabel="Add step"
          />
        </FormSection>

        <FormSection title="Suppliers" icon="ti-world">
          <RepeatableRows
            items={form.suppliers}
            onChange={(v) => set('suppliers', v)}
            fields={[
              { key: 'name', placeholder: 'Supplier name', width: 2 },
              { key: 'location', placeholder: 'Location', width: 2 },
              { key: 'type', placeholder: 'Type', width: 1 },
              { key: 'rating', placeholder: 'Rating (0–5)', type: 'number', width: 1 },
            ]}
            emptyRow={{ name: '', location: '', type: '', rating: '' }}
            addLabel="Add supplier"
          />
        </FormSection>

        <FormSection title="Competitors" icon="ti-users">
          <RepeatableRows
            items={form.competitors}
            onChange={(v) => set('competitors', v)}
            fields={[
              { key: 'name', placeholder: 'Company name', width: 2 },
              { key: 'share', placeholder: 'Market share', width: 1 },
              { key: 'size', placeholder: 'Size', width: 1 },
              { key: 'threat', placeholder: `Threat (${THREAT_OPTIONS.join('/')})`, width: 1 },
            ]}
            emptyRow={{ name: '', share: '', size: '', threat: '' }}
            addLabel="Add competitor"
          />
        </FormSection>

        <div style={{ position: 'sticky', bottom: 20, marginTop: 20 }}>
          <Button type="submit" variant="primary" loading={saving} style={{ width: '100%', padding: '13px 0', fontSize: 14 }}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
