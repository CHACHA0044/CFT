import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CardNav = ({
  logo,
  logoAlt = "Menu",
  items,
  width = "300px", // width of expanding panel
  menuColor = "#111",
  textColor = "#fff",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed top-6 left-5 z-50">
      {/* Lottie / Logo Button */}
      <div
        className="cursor-pointer w-12 h-12"
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

      {/* Expanding Right Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="nav-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width }}
            className="fixed top-0 right-0 h-full shadow-xl flex flex-col p-6"
          >
            {/* Close Area (Click Logo again) */}
            <div
              className="absolute top-5 right-5 w-12 h-12 cursor-pointer"
              onClick={toggleMenu}
            >
              {logo}
            </div>

            {/* Nav Links */}
            <nav className="mt-20 space-y-6 text-lg font-semibold">
              {items.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  className="block"
                  style={{ color: textColor }}
                  onClick={() => setIsOpen(false)} // close on click
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardNav;
