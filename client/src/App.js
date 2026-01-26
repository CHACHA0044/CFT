import { BrowserRouter as Router } from 'react-router-dom';
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
        <Analytics />
        <SpeedInsights />
      </LoadingProvider>
    </Router>
  );
}

export default App;
