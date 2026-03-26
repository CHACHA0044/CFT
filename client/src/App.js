import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AnimatedRoutes from './Components/AnimatedRoutes';
import { LoadingProvider } from 'context/LoadingContext';
import React, { useEffect } from 'react';
import ScrollToTop from 'common/ScrollToTop';
import PageLoader from 'common/PageLoader';
import NavigationLoader from 'common/NavigationLoader';
import { StyleInjector } from 'Components/globalbuttons';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { fetchCsrfToken } from 'utils/csrf';

function getInsightsRoute(pathname) {
  if (/^\/edit\/[^/]+$/.test(pathname)) return '/edit/:id';
  if (/^\/verify-email\/[^/]+$/.test(pathname)) return '/verify-email/:token';
  return pathname;
}

function Observability() {
  const location = useLocation();

  return (
    <>
      <Analytics mode="production" />
      <SpeedInsights route={getInsightsRoute(location.pathname)} />
    </>
  );
}

function App() {
//Fetch CSRF token on app mount
  useEffect(() => {
    const initCsrf = async () => {
      try {
        await fetchCsrfToken();
        console.log('CSRF token initialized');
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
        // App continues to work - token will be fetched on first state-changing request
      }
    };

    initCsrf();
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LoadingProvider>
        <ScrollToTop />
        <PageLoader />
        <NavigationLoader />
        <StyleInjector />
        <AnimatedRoutes />
        {process.env.NODE_ENV === 'production' ? <Observability /> : null}
      </LoadingProvider>
    </Router>
  );
}

export default App;
