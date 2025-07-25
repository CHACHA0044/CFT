import React, { useEffect, useState } from 'react';
import { useLoading } from 'context/LoadingContext';
const PageWrapper = ({ children, backgroundImage }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const { setLoading, canStop } = useLoading();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

useEffect(() => {
  const img = new Image();
  img.src = backgroundImage;
  img.onload = () => {
    setBgLoaded(true);  
    setLoading(false);  // stop loader only when bg is ready
  };
}, [backgroundImage, setLoading]);


  useEffect(() => {
  console.log('bgLoaded:', bgLoaded, 'canStop:', canStop);
  if (bgLoaded && canStop) {
    console.log('→hitting loader');
    setLoading(false);
  }
}, [bgLoaded, canStop, setLoading]);


useEffect(() => {
  const fallback = setTimeout(() => {
    console.warn('Loader fallback triggered');
    setLoading(false);
  }, 3000);
  return () => clearTimeout(fallback);
}, [setLoading]);


  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };
console.log('PageWrapper image:', backgroundImage);
  return (
       <div
      className={`min-h-screen w-full flex flex-col justify-between items-center transition-opacity duration-500 ${
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

      {/* Dark mode toggle button */}
      <div className="relative w-full px-0">
      <div className="absolute top-3 right-2 md:right-3 z-50">
        <button
          onClick={toggleTheme}
          className="px-3 py-4 bg-transparent text-emerald-700 dark:text-white transition duration-300"
        >
          {darkMode ? '⁺₊⋆ ☾ ⋆⁺₊' : '⁺₊⋆ 𖤓 ⋆⁺₊'}
        </button>
      </div>
      </div>

      {/* Content area */}
      <div className="flex-grow w-full flex flex-col items-center justify-center px-4">
        {children}
      </div>

      {/* Footer fixed to bottom center */}
      <footer className="w-full text-center text-base italic py-4 text-emerald-700 dark:text-white">
      Carbon down. Future up. v0.0.1
      </footer>
    </div>
  );
};

export default PageWrapper;
