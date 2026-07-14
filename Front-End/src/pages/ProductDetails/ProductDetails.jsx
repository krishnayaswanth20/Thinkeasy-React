import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FeedbackWidget from '../../components/Feedback/FeedbackWidget';
import AnalyticsCharts from '../BusinessDetails/AnalyticsCharts';
import {
  HighlightPills, BadgesMeta, FinancialsTable, SuppliersTable, CompetitorsTable, Roadmap,
} from '../BusinessDetails/Sections';
import { useBusinessDetails } from '../../hooks/useBusinessDetails';
import { useSearchData } from '../../hooks/useSearchData';
import { fmtIndian } from '../../utils/bizFormat';
import { Activity } from '../../utils/activity';
import SEO, { businessJsonLd } from '../../components/SEO/SEO';
import ReadingProgress from '../../components/DetailPage/ReadingProgress';
import DetailToolbar from '../../components/DetailPage/DetailToolbar';
import ROICalculator from '../../components/DetailPage/ROICalculator';
import RelatedCarousel from '../../components/DetailPage/RelatedCarousel';
import '../../styles/product-details.css';
import '../../styles/detail-enhancements.css';

function Skeleton() {
  return (
    <div>
      <div className="skeleton sk-hero" />
      <div className="skeleton sk-title" />
      <div className="skeleton sk-sub" />
      <div className="sk-grid"><div className="skeleton sk-card" /><div className="skeleton sk-card" /><div className="skeleton sk-card" /><div className="skeleton sk-card" /></div>
      <div className="skeleton sk-section" />
      <div className="skeleton sk-chart" />
      <div className="skeleton sk-chart" />
    </div>
  );
}

function ErrorState({ info }) {
  const navigate = useNavigate();
  return (
    <div className="empty-state">
      <div className="empty-icon"><i className="ti ti-alert-circle" style={{ fontSize: 40 }} /></div>
      <h2>{info?.title || 'Something went wrong'}</h2>
      <p>{info?.message || 'Unable to load business data. Please try again.'}</p>
      <button className="btn-back" onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  );
}

function Section({ id, icon, title, noPad, children }) {
  return (
    <div className="section" id={id}>
      <div className="section-card">
        <div className="section-header"><div className="section-title"><i className={`ti ${icon}`} /> {title}</div></div>
        <div className="section-body" style={noPad ? { padding: 0 } : undefined}>{children}</div>
      </div>
    </div>
  );
}

function TopNav() {
  const navigate = useNavigate();
  return (
    <>
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="logo-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3zm0 4h18v2H3z" fill="#fff" /></svg></div>
          Think<span className="accent">Easy</span>
        </div>
        <div className="topnav-links">
          <a href="/">Home</a>
          <a href="/#roi">Opportunities</a>
          <a href="#">Tools</a>
          <a href="#">Guides</a>
        </div>
        <div className="topnav-right">
          <button className="nav-back" onClick={() => navigate(-1)}><i className="ti ti-chevron-left" /> Back</button>
          <button className="btn-primary-sm" onClick={() => navigate('/')}>Free Account</button>
        </div>
      </nav>
      <div className="breadcrumb">
        <a href="/">Home</a><span className="sep">›</span>
        <a href="/#roi">Opportunities</a><span className="sep">›</span>
        <a href="/#products">Products</a><span className="sep">›</span>
        <span id="breadcrumbName">Loading…</span>
      </div>
    </>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { data: biz, status, errorInfo } = useBusinessDetails(id, 'product');
  const searchData = useSearchData();

  useEffect(() => {
    searchData.ensureLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (biz?.id) {
      Activity.recordView(biz.id);
      document.title = `${biz.name || 'Product'} — Think Easy`;
    }
  }, [biz]);

  if (status === 'loading') {
    return (
      <div className="pd-page">
        <TopNav />
        <div className="page-wrapper"><Skeleton /></div>
        <PageFooter />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="pd-page">
        <TopNav />
        <div className="page-wrapper"><ErrorState info={errorInfo} /></div>
        <PageFooter />
      </div>
    );
  }

  const name = biz.name || 'Unnamed Business';
  const category = biz.category || biz.category_name || 'Business';
  const msRaw = biz.market_size || biz.marketSize || '';
  const inv = biz.investment || '';
  const mini = biz.min_investment || biz.minInvestment || '';
  const maxi = biz.max_investment || biz.maxInvestment || '';
  const pm = biz.profit_margin || biz.profitMargin || '';
  const gr = biz.growth_rate || biz.growthRate || '';
  const bval = biz.breakeven_value || biz.breakevenValue || '';
  const bunit = biz.breakeven_unit || biz.breakevenUnit || 'Months';
  const bfull = biz.breakeven || (bval ? `${bval} ${bunit}` : '');
  const overview = biz.overview || biz.description || 'No overview available.';

  const msFmt = fmtIndian(msRaw) || (msRaw || '—');
  const minFmt = fmtIndian(mini) || mini || null;
  const maxFmt = fmtIndian(maxi) || maxi || null;
  const bDisp = bval ? `${bval} ${bunit}` : (bfull || null);

  return (
    <div className="pd-page">
      <ReadingProgress />
      <SEO
        title={name}
        description={overview !== 'No overview available.' ? overview.slice(0, 155) : undefined}
        path={`/product/${biz.id}`}
        jsonLd={businessJsonLd(biz, `${window.location.origin}/product/${biz.id}`)}
      />
      <TopNav />
      <div className="page-wrapper">
        <div className="biz-hero section">
          <div className="biz-hero-banner" />
          <div className="biz-hero-body">
            <div className="biz-category-badge"><i className="ti ti-building-store" /> {category}</div>
            <div className="biz-name">{name}</div>
            <div className="biz-meta-row"><BadgesMeta badges={biz.badges} /></div>
            <DetailToolbar id={biz.id} name={biz.name} />
          </div>
        </div>

        <Section id="section-overview" icon="ti-layout-dashboard" title="Product Overview">
          <p className="overview-text">{overview}</p>
        </Section>

        <Section id="section-highlights" icon="ti-star" title="Key Highlights">
          <div className="highlights-wrap"><HighlightPills badges={biz.badges} /></div>
        </Section>

        <Section id="section-financials" icon="ti-report-money" title="Financial Details" noPad>
          <FinancialsTable rows={[
            ['Market Size', msFmt], ['Min Investment', minFmt || inv || null], ['Max Investment', maxFmt],
            ['Profit Margin', pm], ['Growth Rate', gr], ['Break-even Period', bDisp],
          ]} />
        </Section>

        <Section id="section-roi-calc" icon="ti-calculator" title="Investment & ROI Calculator">
          <ROICalculator biz={biz} />
        </Section>

        <AnalyticsCharts biz={biz} />

        <Section id="section-suppliers" icon="ti-world" title="Verified Suppliers" noPad>
          <SuppliersTable suppliers={biz.suppliers} />
        </Section>

        <Section id="section-competitors" icon="ti-users" title="Competitor Landscape" noPad>
          <CompetitorsTable competitors={biz.competitors} />
        </Section>

        <Section id="section-roadmap" icon="ti-route" title="Business Roadmap">
          <Roadmap roadmap={biz.roadmap} />
        </Section>

        <Section id="section-related-products" icon="ti-package" title="Related Products">
          <RelatedCarousel
            items={(searchData.getCached()?.products || []).filter((p) => (p.category_name || p.category) === category)}
            currentId={biz.id}
            basePath="/product"
            title="Similar products in this category"
          />
        </Section>

        <Section id="section-related-businesses" icon="ti-building-store" title="Related Businesses">
          <RelatedCarousel
            items={(searchData.getCached()?.businesses || []).filter((b) => (b.category_name || b.category) === category)}
            currentId={biz.business_id || biz.id}
            basePath="/business"
            title="Businesses in this category"
          />
        </Section>
      </div>
      <PageFooter />
      <FeedbackWidget context={() => ({ id: biz.id, name: biz.name })} />
    </div>
  );
}

function PageFooter() {
  return <footer className="footer">&copy; {new Date().getFullYear()} <span>Think Easy</span> — Business Intelligence for Indian Entrepreneurs</footer>;
}
