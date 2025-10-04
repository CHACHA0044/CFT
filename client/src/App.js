import { BrowserRouter as Router } from 'react-router-dom';
import AnimatedRoutes from './Components/AnimatedRoutes';
import { LoadingProvider } from 'context/LoadingContext';
import React, {useEffect} from 'react';
import ScrollToTop from 'common/ScrollToTop';
import PageLoader from 'common/PageLoader';
import NavigationLoader from 'common/NavigationLoader';
//import { useEffect } from 'react';
//import { useLoading } from 'context/LoadingContext';
import { StyleInjector } from 'Components/globalbuttons';
//import Lottie from 'lottie-react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

function App() {
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
