import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './Home';
import Login from './Auth/Login/Login';
import Register from './Auth/Register/Register';

// Lazy-loaded routes (heavier pages)
const Dashboard = lazy(() => import('./Dashboard/Dashboard'));
const ChartPage = lazy(() => import('./Dashboard/ChartPage'));
const History = lazy(() => import('./Footprint/History'));
const Footprint = lazy(() => import('./Footprint/Footprint'));
const EditFootprintForm = lazy(() => import('./Footprint/EditFootprintForm'));
const VerifyEmail = lazy(() => import('./Auth/VerifyEmail'));
const ResetPassword = lazy(() => import('./Auth/ResetPassword'));
const AboutPage = lazy(() => import('./about'));

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="text-white text-lg animate-pulse">Loading...</div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <>
  <AnimatePresence mode="wait" initial={false}>
    <Suspense fallback={<RouteFallback />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/footprint" element={<Footprint />} />
        <Route path="/history" element={<History />} />
        <Route path="/edit/:id" element={<EditFootprintForm />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Suspense>
  </AnimatePresence>
</>
  );
};

export default AnimatedRoutes;
