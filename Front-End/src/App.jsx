import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminProtectedRoute from './components/Routing/AdminProtectedRoute';
import PageFallback from './components/Routing/PageFallback';
import { trackPageView } from './services/analytics';

// Route-level code splitting — each page ships as its own chunk and is
// only downloaded when the visitor navigates to it.
const Home = lazy(() => import('./pages/Home/Home'));
const BusinessDetails = lazy(() => import('./pages/BusinessDetails/BusinessDetails'));
const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails'));
const FeedbackCenter = lazy(() => import('./pages/Feedback/FeedbackCenter'));
const Login = lazy(() => import('./pages/Login/Login'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ServerError = lazy(() => import('./pages/ServerError'));

// Admin (Phase 3) — its own session/auth, its own lazy chunks.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard/AdminDashboard'));
const AdminCategories = lazy(() => import('./pages/admin/Categories/AdminCategories'));
const AdminBusinesses = lazy(() => import('./pages/admin/Businesses/AdminBusinesses'));
const AdminBusinessForm = lazy(() => import('./pages/admin/Businesses/AdminBusinessForm'));
const AdminProducts = lazy(() => import('./pages/admin/Products/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/Products/AdminProductForm'));
const AdminFeedback = lazy(() => import('./pages/admin/Feedback/AdminFeedback'));
const AdminImportWizard = lazy(() => import('./pages/admin/ImportWizard/AdminImportWizard'));
const AdminSettings = lazy(() => import('./pages/admin/Settings/AdminSettings'));
const AdminComingSoon = lazy(() => import('./pages/admin/AdminComingSoon'));

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.div>
  );
}

// Mounts AdminAuthProvider only for the /admin/* subtree, so the rest of
// the app never pays for an admin session check it doesn't need.
function AdminRoot() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="/business/:id" element={<AnimatedPage><BusinessDetails /></AnimatedPage>} />
          <Route path="/product/:id" element={<AnimatedPage><ProductDetails /></AnimatedPage>} />
          <Route path="/feedback" element={<AnimatedPage><FeedbackCenter /></AnimatedPage>} />
          <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
          <Route path="/about" element={<AnimatedPage><ComingSoon title="About" /></AnimatedPage>} />
          <Route path="/market-insights" element={<AnimatedPage><ComingSoon title="Market Insights" /></AnimatedPage>} />
          <Route path="/ai-advisor" element={<AnimatedPage><ComingSoon title="AI Advisor" /></AnimatedPage>} />
          <Route path="/500" element={<AnimatedPage><ServerError /></AnimatedPage>} />

          <Route path="/admin" element={<AdminRoot />}>
            <Route path="login" element={<AnimatedPage><AdminLogin /></AnimatedPage>} />
            <Route
              element={(
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              )}
            >
              <Route index element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
              <Route path="categories" element={<AnimatedPage><AdminCategories /></AnimatedPage>} />
              <Route path="businesses" element={<AnimatedPage><AdminBusinesses /></AnimatedPage>} />
              <Route path="businesses/new" element={<AnimatedPage><AdminBusinessForm /></AnimatedPage>} />
              <Route path="businesses/:id/edit" element={<AnimatedPage><AdminBusinessForm /></AnimatedPage>} />
              <Route path="products" element={<AnimatedPage><AdminProducts /></AnimatedPage>} />
              <Route path="products/new" element={<AnimatedPage><AdminProductForm /></AnimatedPage>} />
              <Route path="products/:id/edit" element={<AnimatedPage><AdminProductForm /></AnimatedPage>} />
              <Route path="import" element={<AnimatedPage><AdminImportWizard /></AnimatedPage>} />
              <Route path="feedback" element={<AnimatedPage><AdminFeedback /></AnimatedPage>} />
              <Route path="settings" element={<AnimatedPage><AdminSettings /></AnimatedPage>} />
              <Route path="*" element={<AnimatedPage><AdminComingSoon title="Not Found" /></AnimatedPage>} />
            </Route>
          </Route>

          <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
