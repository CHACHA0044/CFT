import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const CardNav = ({
  logo,
  logoAlt,
  items,
  baseColor,
  menuColor,
  buttonBgColor,
  buttonTextColor,
  ease,
  isMenuOpen,
  onToggleMenu,
}) => {
  const menuRef = useRef(null);
  const tlRef = useRef(null);

  // GSAP animation for expanding/collapsing the menu
  useEffect(() => {
    if (menuRef.current) {
      const tl = gsap.timeline({ paused: true });
      tl.to(menuRef.current, {
        height: "100vh",
        backgroundColor: menuColor,
        ease: ease,
        duration: 0.6,
      });
      tlRef.current = tl;
    }
  }, [menuColor, ease]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isMenuOpen) {
      onToggleMenu(true);
      tl.play(0);
    } else {
      tl.eventCallback("onReverseComplete", () => onToggleMenu(false));
      tl.reverse();
    }
  };

  return (
    <div className="relative w-full">
      {/* Logo (Lottie-controlled) */}
      <div
        className="absolute top-5 right-5 z-50 cursor-pointer w-12 h-12"
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === "Enter" && toggleMenu()}
      >
        {logo || (
          <img
            src=""
            alt={logoAlt || "Menu logo"}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Expanding Menu */}
      <div
        ref={menuRef}
        className={`card-nav fixed top-0 left-0 w-full overflow-hidden ${
          isMenuOpen ? "open" : ""
        }`}
        style={{ height: isMenuOpen ? "100vh" : "0", backgroundColor: baseColor }}
      >
        <nav
          className={`card-nav-content absolute top-20 left-1/2 transform -translate-x-1/2 text-center space-y-8 text-3xl font-bold transition-opacity duration-500 ${
            isMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
          }`}
          aria-hidden={!isMenuOpen}
        >
          {items.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="block"
              style={{ color: buttonTextColor }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default CardNav;
