import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './Home';
import Login from './Auth/Login/Login';
import Register from './Auth/Register/Register';
import Dashboard from './Dashboard/Dashboard';
import History from './Footprint/History';
import Footprint from './Footprint/Footprint';
import EditFootprintForm from './Footprint/EditFootprintForm';
import VerifyEmail from './Auth/VerifyEmail';
import ChartPage from './Dashboard/ChartPage';
import AboutPage from './about';
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <>
  <AnimatePresence mode="wait" initial={false}>
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
      <Route path="/about" element={<AboutPage />} />
      <Route path="/" element={<Home />} />
    </Routes>
  </AnimatePresence>
</>
  );
};

export default AnimatedRoutes;
