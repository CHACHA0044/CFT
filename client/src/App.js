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


function App() {
  useEffect(() => {
  const timeout = setTimeout(() => {
    sessionStorage.removeItem('authToken');
  }, 60 * 60 * 1000); // 1 hour auto-clear

  return () => clearTimeout(timeout);
}, []);
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LoadingProvider>
        <ScrollToTop />
        <PageLoader />
        <NavigationLoader />
        <StyleInjector />
        <AnimatedRoutes />
      </LoadingProvider>
    </Router>
  );
}

export default App;
