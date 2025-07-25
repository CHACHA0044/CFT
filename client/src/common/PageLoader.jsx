import React from 'react';
import { easeInOut, motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <motion.div
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center w-full h-full"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <motion.span
        className="text-6xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      >
        🌍
      </motion.span>
    </motion.div>
  );
}
