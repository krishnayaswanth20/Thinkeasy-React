import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DetailSidebar from '../../components/Sidebar/DetailSidebar';
import FeedbackWidget from '../../components/Feedback/FeedbackWidget';
import AnalyticsCharts from './AnalyticsCharts';
import {
  HighlightPills, BadgesMeta, FinancialsTable, SuppliersTable, CompetitorsTable,
  SWOT, Risks, Opportunities, Roadmap, Sources, Schemes, RelatedProducts, AIAdvisor,
} from './Sections';
import { useBusinessDetails } from '../../hooks/useBusinessDetails';
import { useSearchData } from '../../hooks/useSearchData';
import { fmtIndian } from '../../utils/bizFormat';
import { Activity } from '../../utils/activity';
import SEO, { businessJsonLd } from '../../components/SEO/SEO';
import ReadingProgress from '../../components/DetailPage/ReadingProgress';
import DetailToolbar from '../../components/DetailPage/DetailToolbar';
import ROICalculator from '../../components/DetailPage/ROICalculator';
import RelatedCarousel from '../../components/DetailPage/RelatedCarousel';
import '../../styles/business-details.css';
import '../../styles/detail-enhancements.css';

function Skeleton() {
  return (
    <div>
      <div className="skeleton sk-hero" />
      <div className="sk-grid"><div className="skeleton sk-card" /><div className="skeleton sk-card" /><div className="skeleton sk-card" /><div className="skeleton sk-card" /></div>
      <div className="skeleton sk-chart" />
      <div className="skeleton sk-section" />
      <div className="skeleton sk-section" />
    </div>
  );
}

function ErrorState({ info, onBack }) {
  return (
    <div id="error-state">
      <div className="empty-state">
        <div className="empty-icon"><i className="ti ti-mood-sad-2" style={{ fontSize: 40 }} /></div>
        <h2>{info?.title || 'Error'}</h2>
        <p>{info?.message || 'Something went wrong.'}</p>
        <button className="btn-back" onClick={onBack}><i className="ti ti-chevron-left" /> Go Back</button>
      </div>
    </div>
  );
}

export default function BusinessDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sourceHint = searchParams.get('source');
  const { data: biz, status, errorInfo } = useBusinessDetails(id, sourceHint);
  const searchData = useSearchData();

  useEffect(() => {
    searchData.ensureLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (biz?.id) {
      Activity.recordView(biz.id);
      document.title = `${biz.name || 'Business'} — Think Easy`;
    }
  }, [biz]);

  function goToOpportunity(oppId, source) {
    navigate(`/${source === 'product' ? 'product' : 'business'}/${oppId}`);
  }

  if (status === 'loading') {
    return (
      <div className="bd-page">
        <TopNav breadcrumbName="Loading…" />
        <div className="page-layout">
          <DetailSidebar />
          <div className="main-content"><Skeleton /></div>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bd-page">
        <TopNav breadcrumbName="Not Found" />
        <div className="page-layout">
          <DetailSidebar />
          <div className="main-content"><ErrorState info={errorInfo} onBack={() => navigate(-1)} /></div>
        </div>
        <PageFooter />
      </div>
    );
  }

  const name = biz.name || 'Unnamed Business';
  const category = biz.category || biz.category_name || 'Business';
  const msRaw = biz.market_size || biz.marketSize || '';
  const gr = biz.growth_rate || biz.growthRate || '';
  const inv = biz.investment || '';
  const mini = biz.min_investment || biz.minInvestment || '';
  const maxi = biz.max_investment || biz.maxInvestment || '';
  const pm = biz.profit_margin || biz.profitMargin || '';
  const bval = biz.breakeven_value || biz.breakevenValue || '';
  const bunit = biz.breakeven_unit || biz.breakevenUnit || 'Months';
  const bfull = biz.breakeven || (bval ? `${bval} ${bunit}` : '');
  const overview = biz.overview || biz.description || 'No overview available.';

  const msFmt = fmtIndian(msRaw) || (msRaw || '—');
  const minFmt = fmtIndian(mini) || mini || null;
  const maxFmt = fmtIndian(maxi) || maxi || null;
  const bDisp = bval ? `${bval} ${bunit}` : (bfull || null);

  return (
    <div className="bd-page">
      <ReadingProgress />
      <SEO
        title={name}
        description={overview !== 'No overview available.' ? overview.slice(0, 155) : undefined}
        path={`/business/${biz.id}`}
        jsonLd={businessJsonLd(biz, `${window.location.origin}/business/${biz.id}`)}
      />
      <TopNav breadcrumbName={name} />
      <div className="page-layout">
        <DetailSidebar />
        <div className="main-content">
          <div className="biz-hero section" id="section-hero">
            <div className="biz-hero-banner" />
            <div className="biz-hero-body">
              <div className="biz-category-badge"><i className="ti ti-building-store" /> {category}</div>
              <div className="biz-name">{name}</div>
              <div className="biz-meta-row"><BadgesMeta badges={biz.badges} /></div>
              <DetailToolbar id={biz.id} name={biz.name} />
            </div>
          </div>

          <div className="metrics-row">
            <div className="metric-card">
              <div className="metric-label">Market Size</div>
              <div className="metric-value">{msFmt}</div>
              {gr && <div className="metric-sub"><i className="ti ti-trending-up" /> {gr} growth</div>}
            </div>
            <div className="metric-card">
              <div className="metric-label">Investment Range</div>
              <div className="metric-value">{minFmt || inv || '—'}</div>
              {maxFmt && <div className="metric-sub">Up to {maxFmt}</div>}
            </div>
            <div className="metric-card">
              <div className="metric-label">Profit Margin</div>
              <div className="metric-value">{pm || '—'}</div>
              <div className="metric-sub">Estimated margin</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Break-even</div>
              <div className="metric-value">{bDisp || '—'}</div>
              <div className="metric-sub">From launch</div>
            </div>
          </div>

          <Section id="section-overview" icon="ti-layout-dashboard" title="Business Overview" badge="Verified Data">
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

          <Section id="section-roi-calc" icon="ti-calculator" title="Investment & ROI Calculator" badge="Interactive">
            <ROICalculator biz={biz} />
          </Section>

          <AnalyticsCharts biz={biz} />

          <Section id="section-roadmap" icon="ti-route" title="Business Roadmap">
            <Roadmap roadmap={biz.roadmap} />
          </Section>

          <Section id="section-suppliers" icon="ti-world" title="Verified Suppliers">
            <SuppliersTable suppliers={biz.suppliers} />
          </Section>

          <Section id="section-competitors" icon="ti-users" title="Competitor Landscape">
            <CompetitorsTable competitors={biz.competitors} />
          </Section>

          <Section id="section-swot" icon="ti-layout-grid" title="SWOT Analysis">
            <SWOT biz={biz} />
          </Section>

          <Section id="section-revenue" icon="ti-chart-arcs" title="Revenue Segments">
            <RevenueNote biz={biz} />
          </Section>

          <Section id="section-risks" icon="ti-alert-triangle" title="Risk Factors">
            <Risks biz={biz} />
          </Section>

          <Section id="section-opportunities" icon="ti-clock" title="Related Opportunities">
            <Opportunities biz={biz} onNavigate={goToOpportunity} />
          </Section>

          <Section id="section-ai" icon="ti-robot" title="AI Business Advisor" badge="Beta">
            <AIAdvisor biz={biz} />
          </Section>

          <Section id="section-sources" icon="ti-file-text" title="Business Sources">
            <Sources biz={biz} />
          </Section>

          <Section id="section-schemes" icon="ti-shield-check" title="Government Schemes">
            <Schemes biz={biz} />
          </Section>

          <Section id="section-related-businesses" icon="ti-building-store" title="Related Businesses">
            <RelatedCarousel
              items={(searchData.getCached()?.businesses || []).filter((b) => (b.category_name || b.category) === category)}
              currentId={biz.id}
              title="Similar businesses in this category"
            />
          </Section>

          <Section id="section-products" icon="ti-package" title="Related Products">
            <RelatedProducts biz={biz} navigate={navigate} />
          </Section>
        </div>
      </div>
      <PageFooter />
      <FeedbackWidget context={() => ({ id: biz.id, name: biz.name })} />
    </div>
  );
}

function Section({ id, icon, title, badge, noPad, children }) {
  return (
    <div className="section" id={id}>
      <div className="section-card">
        <div className="section-header">
          <div className="section-title"><i className={`ti ${icon}`} /> {title}</div>
          {badge && <span className="verified-badge">{badge}</span>}
        </div>
        <div className="section-body" style={noPad ? { padding: 0 } : undefined}>{children}</div>
      </div>
    </div>
  );
}

function RevenueNote({ biz }) {
  const segs = biz.revenue_segments || biz.revenueSegments;
  if (!segs) return <p className="no-data">No revenue segment data available. See the Analytics section above for revenue-related charts.</p>;
  return <p className="no-data">See the revenue breakdown chart in the Analytics section above.</p>;
}

function TopNav({ breadcrumbName }) {
  const navigate = useNavigate();
  return (
    <>
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="logo-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#fff" /></svg></div>
          Think<span className="accent">Easy</span>
        </div>
        <div className="topnav-links">
          <a href="/">Home</a>
          <a href="/#roi">Opportunities</a>
          <a href="/#about">About</a>
        </div>
        <div className="topnav-right">
          <button className="nav-back" onClick={() => navigate(-1)}>
            <i className="ti ti-chevron-left" /> Back
          </button>
        </div>
      </nav>
      <div className="breadcrumb">
        <a href="/">Home</a><span className="sep">›</span>
        <a href="/#roi">Opportunities</a><span className="sep">›</span>
        <span>{breadcrumbName}</span>
      </div>
    </>
  );
}

function PageFooter() {
  return <footer className="footer">&copy; {new Date().getFullYear()} <span>ThinkEasy</span> — All rights reserved.</footer>;
}
