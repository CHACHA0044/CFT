import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useLocation } from "react-router-dom";
const AniDot = () => (
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
);
  const pageDescriptions = {
  "/dashboard": "View your entries 📊, visualize data 🔍, and much more 🌱",
  "/history": "See all entries 🗂️, edit ✏️ or delete 🗑️ past data",
  "/footprint": "Add a new carbon entry 📝 and track your impact 🌱",
  "/chart": "Analyze carbon 🌍, track weather 🌦️, compare leaderboard 🏆, view charts 📈",
  "/edit": "Update an old entry ✏️ and adjust your carbon data 🔄",
};
const pageNames = {
  "/dashboard": "- Dash",
  "/history": "- His",
  "/footprint": "- Foot",
  "/chart": "- Chart",
  "/edit": "- Edit",
};

const CardNav = ({
  logo,
  logoAlt = "Menu",
  items,
  width = "200px", 
  height = "155px",// width of expanding panel
  menuColor = "#111",
  textColor = "#fff",
  logoSize = "w-25 h-25",
  logoClass = "text-emerald-600 dark:text-gray-100 text-shadow-DEFAULT ",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const shimmerControls = useAnimation();
  const toggleMenu = () => setIsOpen(!isOpen);
  const location = useLocation();
  const topClass = location.pathname === "/dashboard" ? "top-7" : "top-0";
  const normalizePathname = (pathname) => { if (pathname.startsWith("/edit")) return "/edit"; return pathname;};
  const normalizedPath = normalizePathname(location.pathname);
  const currentPage = pageNames[normalizedPath] || "";
  const fullTitle = `Menu ${currentPage}`;
  const description = pageDescriptions[normalizedPath] || "";

useEffect(() => {
  let isMounted = true;
  async function loopAnimation() {
    while (isMounted) {
      await shimmerControls.start(i => ({
        scale: [1, 1.3, 1],
        opacity: [1, 0.8, 1],
        transition: { duration: 0.4, ease: "easeInOut", delay: i * 0.15 }
      }));
      await new Promise(res => setTimeout(res, 800)); } }
  loopAnimation();
  return () => {
    isMounted = false; 
  };
}, [shimmerControls]);

  return (
    <div className={`absolute left-0 pl-1 ${topClass} z-50`}>
      {/* Lottie / Logo Button */}
      <div
        className={`cursor-pointer ${logoSize} ${logoClass}`}
        onClick={toggleMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleMenu()}
      >
        {logo || (
          <img
            src=""
            alt={logoAlt}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Expanding Panel (slides out to right) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="nav-panel"
            initial={{ x: `-${width}` }}
            animate={{ x: 0 }}
            exit={{ x: `-${width}` }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width }}
            className="absolute left-0 top-0 h-auto p-4 bg-white/20 dark:bg-gray-800/70 rounded-r-3xl backdrop-blur-md shadow-lg flex flex-col"
          >
            {/* Optional Title */}

<motion.div
  initial={{ y: -30, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 500, damping: 15 }}
  className=" pl-2 pt-10 md:text-2xl text-xl font-bespoke font-medium sm:font-semibold  text-emerald-600 dark:text-gray-100"
>
<motion.span className="flex flex-wrap">
  {fullTitle.split("").map((char, i) => (
    <motion.span
      key={i}
      custom={i}
      animate={shimmerControls}
      className="inline-block"
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  ))}
</motion.span>
</motion.div>
{/* Page Description */}
{description && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
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
                    onClick={() => setIsOpen(false)} // close on click
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
  );
};

export default CardNav;
