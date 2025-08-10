import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const startLoading = useCallback(() => {
  clearTimeout(timerRef.current);
  setLoading(true);
}, []);

  const stopLoading = useCallback(() => {
    clearTimeout(timerRef.current);
    setLoading(false);
  }, []);

  const value = React.useMemo(() => ({ loading, startLoading, stopLoading }), [loading, startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
