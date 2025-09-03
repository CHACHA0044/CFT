import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import loadingAnimation from 'animations/Loading.json';
import { useLoading } from 'context/LoadingContext';

function useIsReload() {
  const hasMounted = useRef(false);
  useEffect(() => {
    hasMounted.current = true;
  }, []);
  return !hasMounted.current; 
}

export default function PageLoader() {
  const { loading, stopLoading } = useLoading();
  const lottieRef = useRef(null);
  const isReload = useIsReload();
  const [bgReady, setBgReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lottieMounted, setLottieMounted] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  useEffect(() => {
  if (loading) {
    setVisible(true);
    setLottieMounted(true);
  }
}, [loading]);

useEffect(() => {
  if (!loading && visible) {
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 300); 

    return () => clearTimeout(timeout);
  }
}, [loading, visible]);

  const handleExitComplete = () => {
    stopLoading();
  };

const lottieSize = isMobile ? 150 : 400; 
const lottieSpeed = isMobile ? 0.6 : 1.5; 
const lottieVariants = {
  initial: { opacity: 0, scale: 0.85, filter: "blur(6px)" },
  enter: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    filter: "blur(4px)",
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1], 
    },
  },
};

  return (
    
    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="page-loader"
          className={`fixed inset-0 bg-black/90 ${isMobile ? '' : 'backdrop-blur-xl'} z-[9999] flex items-center justify-center`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 0.9, 0.2, 1] }}
          style={{
            transform: "translateZ(0)"
          }}
        >
          <Lottie
            animationData={loadingAnimation}
            autoplay
            loop
            lottieRef={lottieRef}
            speed={lottieSpeed}
            style={{ width: lottieSize, height: lottieSize, zIndex: 10 }}
            variants={lottieVariants}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
