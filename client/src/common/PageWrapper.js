import React, { useEffect, useState, useRef } from 'react';
import { useLoading } from 'context/LoadingContext';
import { motion } from 'framer-motion';

let emojiIndex = 0;
//⋆｡ﾟ☁︎⏾⋆☁︎｡
const emojiSets = {
  dark: ['⋆｡ﾟ☁︎', '⋆｡ﾟ☁︎ ⏾ ', '⋆｡ﾟ☁︎ ⏾ ⋆☁︎｡ﾟ', ' ⏾ ⋆☁︎｡ﾟ', '⋆☁︎｡ﾟ'],
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
      className="px-3 py-4 bg-transparent sm:text-emerald-700 sm:dark:text-white transition-all duration-300"
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
    return localStorage.getItem('theme') === 'dark';
  });
  const [bgLoaded, setBgLoaded] = useState(false);
  const { stopLoading, startLoading } = useLoading();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
 const timeoutRef = useRef(null);
  const fallbackRef = useRef(null);
  const hasMounted = useRef(false);
  
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
  <div className="absolute top-1 sm:top-1 right-2 md:right-3 z-50">
    <AnimatedDarkModeButton darkMode={darkMode} toggleTheme={toggleTheme} />
  </div>
</div>

      {/* Content area */}
      <div className="flex-grow w-full flex flex-col items-center justify-center px-4">
        {children}
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-base italic py-4 text-emerald-700 dark:text-white">
      Carbon down. Future up. v0.0.1
      </footer>
    </div>
  );
};

export default PageWrapper;
