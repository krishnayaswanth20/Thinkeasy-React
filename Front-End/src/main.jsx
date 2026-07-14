import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import { initAnalytics } from './services/analytics';
import './styles/design-system.css';
import './styles/home.css';
import './styles/ui-kit.css';
import './styles/navbar-upgrade.css';
import './styles/feedback-upgrade.css';

initAnalytics();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <ToastProvider>
            <NotificationProvider>
              <OfflineBanner />
              <App />
            </NotificationProvider>
          </ToastProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
