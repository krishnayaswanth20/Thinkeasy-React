import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import FeedbackWidget from '../../components/Feedback/FeedbackWidget';
import AuthModal from '../../components/Modals/AuthModal';
import CompareBar from '../../components/Modals/CompareBar';
import HeroSection from './HeroSection';
import TrendingSection from './TrendingSection';
import { InsightsSection, ROISection, ProductsSection, GrowthSection } from './InsightsAndROI';
import { DashboardSection, RecentlyViewedSection, RecommendedSection, SavedSection } from './PersonalSections';
import { JourneySection, ComparisonSection, CTASection, SiteFooter } from './StaticSections';
import { useHomeData } from '../../hooks/useHomeData';
import { useAuth } from '../../contexts/AuthContext';
import { Activity } from '../../utils/activity';
import SEO from '../../components/SEO/SEO';

export default function Home() {
  const { categories, businesses, products, loading, error, refreshScores } = useHomeData();
  const { user, isLoggedIn, openModal, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshTick, setRefreshTick] = useState(0);
  const [compareHint, setCompareHint] = useState('');

  const bump = () => setRefreshTick((t) => t + 1);

  const openBusiness = useCallback((id, recordView = true) => {
    if (recordView) Activity.recordView(id);
    refreshScores();
    bump();
    navigate(`/business/${id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, refreshScores]);

  const goToProduct = useCallback((id) => navigate(`/product/${id}`), [navigate]);

  const onBookmarkToggle = () => { bump(); };
  const onCompareToggle = () => { bump(); };
  const onCompareBlocked = (msg) => {
    setCompareHint(msg);
    setTimeout(() => setCompareHint(''), 2400);
  };
  const onAfterInteraction = () => { refreshScores(); bump(); };

  const trendingPool = useMemo(
    () => [...businesses].filter((b) => b.name).sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0)).slice(0, 14),
    [businesses],
  );

  const authArea = isLoggedIn ? (
    <button
      className="user-menu-btn"
      onClick={() => { if (window.confirm(`Log out of ${user.email}?`)) logout(); }}
    >
      <span className="user-menu-avatar">{(user.name || user.email || '?').trim().charAt(0).toUpperCase()}</span>
      <span className="user-menu-name">{user.name || user.email}</span>
      <i className="ti ti-chevron-down" style={{ fontSize: 14, color: 'var(--muted)' }} />
    </button>
  ) : (
    <>
      <button className="btn-ghost" onClick={() => openModal('login')}><i className="ti ti-user" /> Login</button>
      <button className="btn-primary-cta" onClick={() => openModal('signup')}>Get Free Account</button>
    </>
  );

  if (error) {
    return (
      <>
        <Navbar active="home" authArea={authArea} />
        <div style={{ maxWidth: 640, margin: '120px auto', textAlign: 'center', color: 'var(--muted)' }}>
          Could not connect to server. Make sure the Flask API is running.
          <br />
          <small style={{ color: 'red' }}>{String(error.message || error)}</small>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO path="/" />
      <Navbar active="home" authArea={authArea} />

      <HeroSection
        businesses={businesses}
        categories={categories}
        onOpenBusiness={openBusiness}
        onGoToProduct={goToProduct}
        onAfterInteraction={onAfterInteraction}
      />

      <DashboardSection businesses={businesses} refreshTick={refreshTick} />

      <TrendingSection
        businesses={businesses}
        onOpen={openBusiness}
        onBookmarkToggle={onBookmarkToggle}
        onCompareToggle={onCompareToggle}
        onCompareBlocked={onCompareBlocked}
      />

      <RecentlyViewedSection businesses={businesses} onOpen={openBusiness} refreshTick={refreshTick} />

      <InsightsSection businesses={loading ? [] : businesses} />

      <ROISection
        businesses={businesses}
        onOpen={openBusiness}
        onBookmarkToggle={onBookmarkToggle}
        onCompareToggle={onCompareToggle}
        onCompareBlocked={onCompareBlocked}
      />

      <ProductsSection products={products} />

      <GrowthSection businesses={businesses} />

      <RecommendedSection
        businesses={businesses}
        trendingPool={trendingPool}
        onOpen={openBusiness}
        onBookmarkToggle={onBookmarkToggle}
        onCompareToggle={onCompareToggle}
        onCompareBlocked={onCompareBlocked}
      />

      <SavedSection
        businesses={businesses}
        onOpen={openBusiness}
        onBookmarkToggle={onBookmarkToggle}
        onCompareToggle={onCompareToggle}
        onCompareBlocked={onCompareBlocked}
        refreshTick={refreshTick}
      />

      <JourneySection />
      <ComparisonSection />
      <CTASection />
      <SiteFooter />

      <CompareBar businesses={businesses} refreshTick={refreshTick} onChange={bump} />
      {compareHint && <div className="cmp-bar-hint show">{compareHint}</div>}

      <Footer />

      <AuthModal />
      <FeedbackWidget context={() => ({ id: null, name: null })} />
    </>
  );
}
