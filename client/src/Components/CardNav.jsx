import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed top-5 left-2 z-50">
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
            className="fixed top-0 left-0 h-auto p-4 bg-white/20 dark:bg-gray-800/70 rounded-r-3xl backdrop-blur-md shadow-lg flex flex-col"
          >
            {/* Optional Title */}
            <div className="text-lg text-center font-semibold text-gray-100 mb-4 flex" aria-label="Menu">
                {"Menu".split("").map((char, i) => (
                    <motion.span
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        delay: i * 0.07, // Staggered delay for each character
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                    }}
                    className="inline-block"
                    aria-hidden="true"
                    >
                    {char}
                    </motion.span>
                ))}
                </div>

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
