import React, { useState, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const AniDot = memo(() => (
  <span aria-hidden="true" className="inline-flex items-center">
    <motion.span
      className="inline-block text-lg font-light sm:text-xl ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
    > 
      .
    </motion.span>
    <motion.span
      className="inline-block text-lg font-light sm:text-xl ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
    >
      .
    </motion.span>
    <motion.span
      className="inline-block text-lg font-light sm:text-xl ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
    >
      .
    </motion.span>
  </span>
));

const SimpleHeadline = memo(({ sentence = "" }) => {
  const words = sentence.split(" ");
  
  return (
    <div className="relative overflow-visible w-full justify-center items-center">
      <motion.div
        className="whitespace-nowrap -ml-1 md:text-3xl text-2xl font-germania font-medium sm:font-semibold tracking-wide text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block mr-2">
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  );
});

const pageDescriptions = {
  "/dashboard": "View your entries 📊, visualize data 🔍, and much more 🌱",
  "/history": "See all entries 🗂️, edit ✏️ or delete 🗑️ past data",
  "/footprint": "Add a new carbon entry 📝 and track your impact 🌱",
  "/chart": "Analyze carbon 🌍, track weather 🌦️, compare leaderboard 🏆, view charts 📈",
  "/edit": "Update an old entry ✏️ and adjust your carbon data 🔄",
  "/profile": "Edit details ✨, check badges 🏅, personalize your experience ⚙️",
};

const pageNames = {
  "/dashboard": "- Dash",
  "/history": "- His",
  "/footprint": "- Foot",
  "/chart": "- Chart",
  "/edit": "- Edit",
  "/profile": "- Me",
};

const CardNav = memo(({
  logo,
  logoAlt = "Menu",
  items,
  width = "200px", 
  menuColor = "#111",
  textColor = "#fff",
  logoSize = "w-25 h-25",
  logoClass = "text-emerald-600 dark:text-gray-100 text-shadow-DEFAULT",
  children,
  isMenuOpen,
  onToggleMenu,
}) => {
  const location = useLocation();
  
  // Memoize computed values
  const { topClass, normalizedPath, currentPage, description, fullTitle } = useMemo(() => {
    const normalizePathname = (pathname) => {
      if (pathname.startsWith("/edit")) return "/edit";
      return pathname;
    };
    
    const topClass = location.pathname === "/dashboard" ? "top-0" : "top-0";
    const normalizedPath = normalizePathname(location.pathname);
    const currentPage = pageNames[normalizedPath] || "";
    const fullTitle = `Menu ${currentPage}`;
    const description = pageDescriptions[normalizedPath] || "";
    
    return { topClass, normalizedPath, currentPage, description, fullTitle };
  }, [location.pathname]);

  const toggleMenu = () => {
    if (onToggleMenu) {
      onToggleMenu(!isMenuOpen);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e) => {
      const panel = e.target.closest('aside');
      const logoButton = e.target.closest('[data-menu-trigger="true"]');
      
      if (!panel && !logoButton) {
        onToggleMenu(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, onToggleMenu]);

  return (
    <>
      {/* Backdrop blur overlay - separate from content */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
            onClick={() => onToggleMenu(false)}
          />
        )}
      </AnimatePresence>

      <div className={`absolute left-0 pl-1 ${topClass} z-50`}>
        {/* Logo Button */}
        <div
          className={`cursor-pointer ${logoSize} ${logoClass}`}
          onClick={toggleMenu}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && toggleMenu()}
          data-menu-trigger="true"
        >
          {logo || (
            <img
              src=""
              alt={logoAlt}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Expanding Panel */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.aside
              key="nav-panel"
              initial={{ x: `-${width}`, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: `-${width}`, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{ width }}
              className="absolute left-0 top-0 h-auto p-4 bg-white/20 dark:bg-gray-800/70 rounded-r-3xl backdrop-blur-md shadow-lg flex flex-col"
            >
              {/* Title */}
              <div className="pl-2 pt-10">
                <SimpleHeadline sentence={fullTitle} />
              </div>

              {/* Description */}
              {description && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-sm md:text-base font-light font-intertight text-gray-600 dark:text-gray-300 mt-2 pl-1"
                >
                  {description}<AniDot />
                </motion.div>
              )}

              {/* Nav Links */}
              <nav className="mt-2 space-y-4 text-lg font-semibold">
                {children ? (
                  children
                ) : (
                  items?.map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      className="block"
                      style={{ color: textColor }}
                      onClick={() => onToggleMenu(false)}
                    >
                      {item.label}
                    </a>
                  ))
                )}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

export default CardNav;