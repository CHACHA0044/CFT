import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from 'context/LoadingContext';

const NavigationLoader = () => {
  const { startLoading, loading } = useLoading();
  const location = useLocation();
  const previousPath = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
  const triggerStart = () => {
    if (!loading) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        startLoading();
      }, 0);
    }
  };

  const handlePop = () => triggerStart();

  window.addEventListener('popstate', handlePop);

  if (previousPath.current !== location.pathname) {
    previousPath.current = location.pathname;
    triggerStart();
  }

  return () => {
    window.removeEventListener('popstate', handlePop);
    clearTimeout(debounceRef.current);
  };
}, [location.pathname]);


  return null;
};

export default NavigationLoader;
