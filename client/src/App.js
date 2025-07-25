import { BrowserRouter as Router } from 'react-router-dom';
import AnimatedRoutes from './Components/AnimatedRoutes';
import { LoadingProvider } from 'context/LoadingContext';
import React from 'react';
import ScrollToTop from 'common/ScrollToTop';
function App() {
  return (
    <Router>
      <LoadingProvider>
        <ScrollToTop />
        <AnimatedRoutes />
      </LoadingProvider>
    </Router>
  );
}

export default App;
