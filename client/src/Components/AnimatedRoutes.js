// src/Components/AnimatedRoutes.js
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Home from './Home';
import Login from './Auth/Login/Login';
import Register from './Auth/Register/Register';
import Dashboard from './Dashboard/Dashboard';
import History from './Footprint/History';
import Footprint from './Footprint/Footprint';
import EditFootprintForm from './Footprint/EditFootprintForm';
import PageLoader from 'common/PageLoader';
import { useLoading } from 'context/LoadingContext';
import VerifyEmail from './Auth/VerifyEmail';

const AnimatedRoutes = () => {
  const location = useLocation();
  const { loading, setLoading, setCanStop } = useLoading();

  // ✅ Trigger loading on every route change
  useEffect(() => {
  setLoading(true);
  setCanStop(false);
  const minTime = setTimeout(() => {
    setCanStop(true);
  }, 200); // min time

  return () => clearTimeout(minTime);
}, [location]);


  return (
    <>
  <AnimatePresence>
    {loading && <PageLoader key="loader" />}
  </AnimatePresence>

  <AnimatePresence mode="wait" initial={false}>
    <Routes location={location} key={location.pathname}>
    <Route path="/home" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/footprint" element={<Footprint />} />
    <Route path="/history" element={<History />} />
    <Route path="/edit/:id" element={<EditFootprintForm />} />
    <Route path="/verify-email/:token" element={<VerifyEmail />} />
    <Route path="/" element={<Home />} />
    </Routes>
  </AnimatePresence>
</>

  );
};

export default AnimatedRoutes;
