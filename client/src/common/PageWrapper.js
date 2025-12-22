import React, { useEffect, useState, useRef } from 'react';
import { useLoading } from 'context/LoadingContext';
import { motion, AnimatePresence } from 'framer-motion';
import appVersion from '../version.json';
const emojiSets = {
  dark: ['⁺₊⋆', '⁺₊⋆ ☾ ', '⁺₊⋆ ☾ ⋆⁺₊', ' ☾ ⋆⁺₊', '⋆⁺₊'],
  light: ['⁺₊⋆', '⁺₊⋆ 𖤓 ', '⁺₊⋆ 𖤓 ⋆⁺₊', ' 𖤓 ⋆⁺₊', '⋆⁺₊'],
};
const emojiSetsMobile = {
  dark: ['⋆', '⋆🌙', '⋆🌙⋆', '🌙⋆', '⋆'],
  light: ['⋆', '⋆🌞', '⋆🌞⋆', '🌞⋆', '⋆'],
};


function AnimatedDarkModeButton({ darkMode, toggleTheme }) {
  const [index, setIndex] = useState(0);
  const buttonRef = useRef();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const activeSet = isMobile
    ? (darkMode ? emojiSetsMobile.dark : emojiSetsMobile.light)
    : (darkMode ? emojiSets.dark : emojiSets.light);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % activeSet.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [darkMode, isMobile, activeSet.length]);

  //const currentSet = darkMode ? emojiSets.dark : emojiSets.light;

  return (
    <motion.button
      ref={buttonRef}
      onClick={toggleTheme}
      initial={false}
      animate={{
        y: [0, -3, 0],
        textShadow: darkMode
          ? ["0px 0px 6px rgba(255,255,255,0.7)", "0px 0px 12px rgba(255,255,255,0.9)", "0px 0px 6px rgba(255,255,255,0.7)"]
          : ["0px 0px 6px rgba(16,185,129,0.6)", "0px 0px 12px rgba(16,185,129,0.8)", "0px 0px 6px rgba(16,185,129,0.6)"]
      }}
      transition={{
        y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
        textShadow: { duration: 0.5 }
      }}
      whileHover={{ 
        scale: 1.4,
        rotate: 0 
      }}
      whileTap={{ 
        scale: 0.7,
        rotate: 0 
      }}
      className="px-3 py-4 bg-transparent sm:text-emerald-500 sm:dark:text-white transition-all duration-300"
      style={{
        transformOrigin: 'center center', 
        willChange: 'transform', 
        transform: 'none',
        backfaceVisibility: 'hidden'
      }}
    >
      {activeSet[index]}
    </motion.button>
  );
}

const PageWrapper = ({ children, backgroundImage }) => {
  const [darkMode, setDarkMode] = useState(() => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme ? savedTheme === 'dark' : true;
});
  const [bgLoaded, setBgLoaded] = useState(false);
  const { stopLoading, startLoading } = useLoading();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
 const timeoutRef = useRef(null);
  const fallbackRef = useRef(null);
  const hasMounted = useRef(false);
  const [showInfo, setShowInfo] = useState(false);
useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

   useEffect(() => {
   const shouldTriggerLoader = !hasMounted.current;
   hasMounted.current = true;

   if (!shouldTriggerLoader) return;

   const img = new Image();
   img.src = backgroundImage;

   const loadStart = Date.now();
   const minimumLoadTime = 800;

   const loadImage = () =>
     new Promise((resolve) => {
       img.onload = resolve;
       img.onerror = resolve;
     });

   Promise.race([
     loadImage(),
     new Promise((resolve) => setTimeout(resolve, minimumLoadTime)),
   ]).then(() => {
     const elapsed = Date.now() - loadStart;
     const remainingTime = Math.max(0, minimumLoadTime - elapsed);

     timeoutRef.current = setTimeout(() => {
       setBgLoaded(true);
       stopLoading();
     }, remainingTime);
   });

   fallbackRef.current = setTimeout(() => {
     setBgLoaded(true);
     stopLoading();
   }, 5000);

   return () => {
     clearTimeout(timeoutRef.current);
     clearTimeout(fallbackRef.current);
   };
 }, [backgroundImage]);
useEffect(() => {
  const handleClickOutside = (event) => {
    if (showInfo && !event.target.closest('footer')) {
      setShowInfo(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showInfo]);

 const toggleTheme = () => {
  setDarkMode(prev => !prev);
};

  return (
       <div
      className={`absolute min-h-full w-full flex flex-col justify-between items-center transition-opacity duration-500 ${
         bgLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundAttachment: isMobile ? 'scroll' : 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000',
      }}
    >

      {/* Dark mode */}
 <div className=" w-full px-0">
  <div className="absolute top-1 sm:top-1 right-2 text-white md:right-3 z-50">
    <AnimatedDarkModeButton darkMode={darkMode} toggleTheme={toggleTheme} />
  </div>
</div>

      {/* Content area */}
      <div className="flex-grow w-full flex flex-col items-center justify-center px-4">
        {children}
      </div>

      {/* Footer */}
     <footer className="w-full text-center tracking-wide text-base font-intertight text-shadow-DEFAULT py-4 text-white relative">
  <AnimatePresence>
    {showInfo && (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-full hidden sm:block -ml-44 left-1/2 transform -translate-x-1/2 -mb-3 bg-emerald-500/90 dark:bg-black/90 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium text-center z-50 whitespace-nowrap"
      >
        Version {appVersion.version} • Update includes new chart sections
      </motion.div>
    )}
  </AnimatePresence>
  
  <button 
    onClick={() => setShowInfo(!showInfo)}
    className="hover:text-emerald-600 dark:hover:text-emerald-300 italic text-shadow-DEFAULT transition-colors duration-200"
  >
    Carbon Down<span className="animate-pulse">.</span> Future Up<span className="animate-pulse">.</span> v {appVersion.version}
  </button>
</footer>
    </div>
  );
};

export default PageWrapper;
