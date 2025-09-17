import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

const CardNav = ({
  logo,
  logoAlt = "Menu",
  items,
  width = "200px", 
  height = "150px",// width of expanding panel
  menuColor = "#111",
  textColor = "#fff",
  logoSize = "w-25 h-25",
  logoClass = "text-emerald-600 dark:text-gray-100 text-shadow-DEFAULT",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const shimmerControls = useAnimation();
  const toggleMenu = () => setIsOpen(!isOpen);
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
    <div className="absolute top-5 left-0 z-50">
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
            className="absolute top-0 left-0 h-auto p-4 bg-white/20 dark:bg-gray-800/70 rounded-r-3xl backdrop-blur-md shadow-lg flex flex-col"
          >
            {/* Optional Title */}

<motion.div
  initial={{ y: -30, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 500, damping: 15 }}
  className=" pl-2 md:text-2xl text-xl font-bespoke font-medium sm:font-semibold  text-emerald-600 dark:text-gray-100"
>
<motion.span className="flex flex-wrap">
  {("Menu").split("").map((char, i) => (
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
            {/* Nav Links */}
            <nav className="mt-10 space-y-4 text-lg font-semibold">
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
