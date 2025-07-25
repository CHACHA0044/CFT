import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(true); // initially true
  const [canStop, setCanStop] = useState(false);
  return (
    <LoadingContext.Provider value={{ loading, setLoading, canStop, setCanStop }}>
      {children}
    </LoadingContext.Provider>
  );
};
