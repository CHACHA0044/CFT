import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, Shield, TrendingDown, Users, BarChart3, 
  Lock, Cloud, Zap, CheckCircle2,
  Code, Layers, Globe, ChevronDown, ChevronUp, Menu, X
} from 'lucide-react';
import PageWrapper from '../common/PageWrapper';
import Lottie from 'lottie-react';
import GlobeAnimation from '../animations/Globe.json';
import { HomeHeaderButton } from './globalbuttons';
import ScrollDownAnimation from 'animations/ScrollDown.json';
import { useLoading } from 'context/LoadingContext';
const AniDot = () => (
  <span aria-hidden="true" className="inline-block items-center">
    <motion.span
      className="inline-block text-lg font-normal sm:text-xl sm:font-semibold ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
    > 
      .
    </motion.span>
    <motion.span
      className="inline-block text-lg font-normal sm:text-xl sm:font-semibold ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
    >
      .
    </motion.span>
    <motion.span
      className="inline-block text-lg font-normal sm:text-xl sm:font-semibold ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
    >
      .
    </motion.span>
  </span>
);
// Simplified StaggeredMenu for section navigation
const StaggeredMenu = ({
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  accentColor = '#10b981',
}) => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <div className="fixed top-3 sm:top-[1rem] left-4 ">
      <div className="relative">
        
        <motion.button
                className="
  relative flex items-center justify-center gap-2 -ml-2 sm:ml-1
  h-10 px-4 text-sm
  sm:h-10 sm:px-5 sm:text-base
  md:h-12 md:px-6 md:text-lg
  sm:rounded-xl rounded-lg font-semibold font-sriracha sm:tracking-wide shadow-lg overflow-hidden dark:text-gray-100 text-emerald-500 "
          onClick={toggleMenu}
                whileTap={{ scale: 0.9, rotate: -2 }}
      whileHover={{
  scale: 1.05,
  rotateX: 2,
  rotateY: -2,
  boxShadow: `
    0 0 20px rgba(255, 255, 255, 0.25),
    0 0 10px rgba(255, 255, 255, 0.2),
    inset 0 2px 4px rgba(255,255,255,0.1),
    inset 0 -3px 6px rgba(0,0,0,0.3)
  `,
  transition: {
    scale: { type: 'spring', stiffness: 1000, damping: 30 },
    boxShadow: { duration: 0.1 },
  },
}}
          aria-label={open ? 'Close menu' : 'Open menu'}
          style={{
  background: '',
  border: '1.5px solid rgba(255,255,255,0.08)',
  borderRadius: '0.75rem',
  backdropFilter: 'blur(2px)',
  boxShadow: `
    0 6px 12px rgba(0,0,0,0.35),
    inset 0 2px 4px rgba(255,255,255,0.15),
    inset 0 -3px 6px rgba(0,0,0,0.4)
  `,
  transition: 'background 0.4s, border 0.4s, color 0.4s',
}}
        >
          <span className="pointer-events-none absolute inset-0 z-10 mix-blend-screen animate-shimmer rounded-xl"/>
          <span className="text-xl font-medium tracking-wide text-shadow-DEFAULT font-sriracha mr-1">{open ? 'Menu' : 'Menu'}</span>
          <div className="w-5 h-4 relative flex flex-col justify-center gap-[3px]">
            <motion.span 
              className="w-full h-[2px] bg-current rounded-full"
              animate={{ 
                rotate: open ? 45 : 0,
                y: open ? 5 : 0,
                originX: 0.5,
                originY: 0.5
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.span 
              className="w-full h-[2px] bg-current rounded-full"
              animate={{ 
                opacity: open ? 0 : 1,
                scaleX: open ? 0 : 1
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.span 
              className="w-full h-[2px] bg-current rounded-full"
              animate={{ 
                rotate: open ? -45 : 0,
                y: open ? -5 : 0,
                originX: 0.5,
                originY: 0.5
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute top-full left-0 mt-7 bg-black/80 backdrop-blur-md border border-emerald-500/30 rounded-lg p-4 min-w-[220px] shadow-2xl"
              style={{ zIndex: 41 }}
            >
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <button
                      onClick={() => {
                        item.onClick?.();
                        setOpen(false);
                      }}
                      className="w-full text-left text-emerald-500 dark:text-white hover:text-emerald-400 transition-colors py-2 px-3 rounded hover:bg-emerald-500/10  font-intertight tracking-wide text-shadow-DEFAULT"
                    >
                      {displayItemNumbering && (
                        <span className="text-emerald-400 mr-2 text-xs font-semibold">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      )}
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>

              {displaySocials && socialItems?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: items.length * 0.05 + 0.1 }}
                  className="mt-4 pt-4 border-t border-emerald-500/20"
                >
                  <p className="text-xs text-emerald-400 mb-2  font-intertight tracking-wide text-shadow-DEFAULT">Socials</p>
                  <div className="ml-3 flex gap-4 flex-wrap">
                    {socialItems.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 dark:text-white hover:text-emerald-400 text-sm transition-colors font-intertight tracking-wide text-shadow-DEFAULT"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const sentence = "About The Carbon Footprint Tracker";
const words = sentence.split(" ");
 
const getLetterVariants = () => ({
  initial: { y: 0, opacity: 1, scale: 1 },
  fall: {
    y: [0, 20, -10, 100],
    x: [0, 10, -10, 0],
    opacity: [1, 0.7, 0],
    rotate: [0, 10, -10, 0],
    transition: { duration: 2, ease: "easeInOut" },
  },
  reenter: {
    y: [-120, 20, -10, 5, 0],
    x: [0, 4, -4, 2, 0],
    scale: [0.9, 1.2, 0.95, 1.05, 1],
    opacity: [0, 1],
    transition: {
      duration: 1.6,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
});

const AnimatedHeadline = () => {
  const [activeBurstIndex, setActiveBurstIndex] = useState(null);
  const [bursting, setBursting] = useState(false);
  const [fallingLetters, setFallingLetters] = useState([]);

  const triggerBurst = (index) => {
    setActiveBurstIndex(index);
    setBursting(true);
    setTimeout(() => {
      setBursting(false);
      setActiveBurstIndex(null);
    }, 1800);
  };

  return (
    <div className="relative overflow-visible w-full flex sm:flex-row justify-center items-center mt-2 ml-4 sm:ml-0 mb-2 px-4">
      <motion.div
        className="flex flex-wrap justify-center gap-2 text-5xl sm:text-6xl md:text-7xl font-black font-germania tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3,
            },
          },
        }}
      >
        {words.map((word, wordIndex) => (
          <motion.span
            key={wordIndex}
            onMouseEnter={() => {
              if (!bursting && activeBurstIndex === null) triggerBurst(wordIndex);
            }}
            onClick={() => {
              if (!bursting && activeBurstIndex === null) triggerBurst(wordIndex);
            }}
            className="relative inline-block cursor-pointer mr-2 sm:mr-4 "
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            {word.split("").map((char, i) => {
              const allChars = sentence.replace(/\s/g, "").split("");
              const charIndex = allChars.findIndex(
                (_, idx) => idx === i + words.slice(0, wordIndex).join("").length
              );

              const isBursting = activeBurstIndex === wordIndex;
              const randomDelay = Math.random() * 0.5 + i * 0.05;

              return (
                <AnimatePresence key={`${char}-${i}`}>
                  <motion.span
                    className="inline-block relative"
                    initial={{
                      x: 0,
                      y: 0,
                      rotate: 0,
                      opacity: 1,
                      scale: 1,
                    }}
                    animate={
                      isBursting
                        ? {
                            x: Math.random() * 80 - 40,
                            y: Math.random() * 60 - 30,
                            rotate: Math.random() * 180 - 90,
                            opacity: [1, 0],
                            scale: [1, 1.2, 0.4],
                            transition: {
                              duration: 0.8,
                              delay: randomDelay,
                              ease: "easeOut",
                            },
                          }
                        : fallingLetters.includes(charIndex)
                        ? "reenter"
                        : "initial"
                    }
                    variants={getLetterVariants()}
                  >
                    {char}
                    {isBursting && (
                      <span className="absolute top-1/2 left-1/2 z-[-1]">
                        {[...Array(5)].map((_, j) => {
                          const confX = Math.random() * 30 - 15;
                          const confY = Math.random() * 30 - 15;
                          return (
                            <motion.span
                              key={j}
                              className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                              initial={{ opacity: 1, scale: 1 }}
                              animate={{
                                x: confX,
                                y: confY,
                                opacity: [1, 0],
                                scale: [1, 0.4],
                              }}
                              transition={{
                                duration: 0.6,
                                delay: randomDelay,
                                ease: "easeOut",
                              }}
                            />
                          );
                        })}
                      </span>
                    )}
                  </motion.span>
                </AnimatePresence>
              );
            })}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

const AboutPage = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [showContent, setShowContent] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const titleRef = useRef(null);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const { loading } = useLoading();
  const sectionRefs = useRef([]);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);
  const lastScrollTime = useRef(0);
  const wheelDeltaBuffer = useRef([]);

  const contentVariants = {
    hidden: { opacity: 0, y: -10, transition: { duration: 0.2, delay: 0.6 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.8 } },
  };

  const [screenHeight, setScreenHeight] = useState({ collapsed: 70, expanded: 110 });

  const sections = [
    { id: 'philosophy', label: 'Philosophy' },
    { id: 'features', label: 'Core Features' },
    { id: 'tech', label: 'Technology Stack' },
    { id: 'api', label: 'API Endpoints' },
    { id: 'security', label: 'Security' },
    { id: 'footer', label: 'Conclusion' }
  ];

  const menuItems = sections.map((section, idx) => ({
    label: section.label,
    onClick: () => scrollToSection(idx)
  }));

  const socialItems = [
  { label: 'GitHub', link: 'https://github.com/CHACHA0044/CFT' },
  { label: 'LinkedIn', link: 'https://www.linkedin.com/in/pranav-dembla-3a1431291' },
  { label: 'Mail', link: 'mailto:carbontracker.noreply@gmail.com' }
];
const subject = encodeURIComponent("I will be re-instituting prima nocta...");
const handleEmailClick = (e) => {
  if (!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    e.preventDefault();
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=carbontracker.noreply@gmail.com&su=${subject}`,
      '_blank'
    );
  }
};

  const scrollToSection = (index) => {
    if (index < 0 || index >= sectionRefs.current.length) return;

    // If we're on hero section and trying to navigate to content sections
    if (!showContent && index > 0) {
      // First scroll past hero to reveal content
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
      
      // Then navigate to the specific section after a delay
      setTimeout(() => {
        const element = sectionRefs.current[index];
        if (element) {
          isScrolling.current = true;
          setCurrentSection(index);
          
          const elementTop = element.offsetTop;
          const offset = window.innerHeight * 0.1;
          
          window.scrollTo({
            top: elementTop - offset,
            behavior: 'smooth'
          });

          if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
          }

          scrollTimeout.current = setTimeout(() => {
            isScrolling.current = false;
          }, 1000);
        }
      }, 500);
    } else if (sectionRefs.current[index]) {
      // Normal section navigation
      isScrolling.current = true;
      setCurrentSection(index);
      
      const element = sectionRefs.current[index];
      const elementTop = element.offsetTop;
      const offset = window.innerHeight * 0.1;
      
      window.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      
      if (scrollTop > 50) {
        setShowContent(true);
      } else {
        setShowContent(false);
        setCurrentSection(0);
        return;
      }

      // Update current section based on scroll position
      if (!isScrolling.current) {
        const windowHeight = window.innerHeight;
        const scrollPosition = scrollTop + windowHeight / 2;

        for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
          const section = sectionRefs.current[i];
          if (section && section.offsetTop <= scrollPosition) {
            setCurrentSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenHeight({ collapsed: 70, expanded: 90 });
      else if (width < 768) setScreenHeight({ collapsed: 75, expanded: 115 });
      else if (width < 1024) setScreenHeight({ collapsed: 80, expanded: 120 });
      else setScreenHeight({ collapsed: 80, expanded: 140 });
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (titleRef.current && !titleRef.current.contains(event.target)) {
        setIsHeaderExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let snapTimeout = null;
    const BUFFER_SIZE = 3;
    const SLOW_SCROLL_THRESHOLD = 20; // pixels - adjust this for sensitivity
    const SNAP_COOLDOWN = 1300; // ms - prevent rapid snapping

    const handleWheel = (e) => {
      if (!showContent) {
        return; // Allow normal scroll on hero section
      }

      const now = Date.now();
      const deltaY = Math.abs(e.deltaY);
      
      // Add to buffer
      wheelDeltaBuffer.current.push(deltaY);
      if (wheelDeltaBuffer.current.length > BUFFER_SIZE) {
        wheelDeltaBuffer.current.shift();
      }

      // Calculate average scroll speed
      const avgDelta = wheelDeltaBuffer.current.reduce((a, b) => a + b, 0) / wheelDeltaBuffer.current.length;
      
      // Determine if this is a slow scroll (smooth) or fast scroll (snap)
      const isSlowScroll = avgDelta < SLOW_SCROLL_THRESHOLD;
      
      if (isSlowScroll || isScrolling.current) {
        // SLOW SCROLL: Allow natural browser scrolling
        return;
      }

      // FAST SCROLL: Snap to sections
      const timeSinceLastScroll = now - lastScrollTime.current;
      
      if (timeSinceLastScroll < SNAP_COOLDOWN) {
        // Too soon after last snap, ignore
        return;
      }

      e.preventDefault();
      
      const direction = e.deltaY > 0 ? 1 : -1;
      const nextSection = currentSection + direction;
      
      if (nextSection >= 0 && nextSection < sections.length) {
        lastScrollTime.current = now;
        scrollToSection(nextSection);
        
        // Clear buffer after snap
        wheelDeltaBuffer.current = [];
        
        // Clear any pending snap timeout
        if (snapTimeout) {
          clearTimeout(snapTimeout);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (snapTimeout) {
        clearTimeout(snapTimeout);
      }
    };
  }, [currentSection, showContent, sections.length, scrollToSection]);

  const handleTap = () => {
    setIsHeaderExpanded(prev => !prev);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };
  
const toggleSection = (sectionId) => {
  setExpandedSections((prev) => ({
    ...prev,
    [sectionId]: !prev[sectionId]
  }));
};

  const getIcon = (iconName) => {
    const icons = {
      Shield: Shield,
      TrendingDown: TrendingDown,
      BarChart3: BarChart3,
      Users: Users,
      Zap: Zap,
      Code: Code,
      Layers: Layers,
      Lock: Lock,
      Cloud: Cloud
    };
    return icons[iconName] || Globe;
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full h-full"
      ref={containerRef}
    >
      <PageWrapper backgroundImage="/images/about-bk.webp">
        <div className="w-full min-h-screen flex flex-col text-emerald-500 dark:text-gray-100 transition-colors duration-500">
          
          {/* Hero Section */}
          <section className="relative flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-10 text-center min-h-screen">
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={showContent ? { opacity: 0, y: -50, pointerEvents: 'none' } : { opacity: 1, y: 0, pointerEvents: 'auto' }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 flex items-center justify-center z-0"
            >
              <div className="flex flex-col items-center gap-4 sm:gap-6 px-4 mt-44">
                <motion.header
                  initial={false}
                  animate={{ height: isHeaderExpanded ? screenHeight.expanded : screenHeight.collapsed }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className={`w-full fixed z-40 top-0 left-0 px-6 py-4
                    bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all duration-500`}
                >
                  <div className="transform sm:translate-x-0 sm:translate-y-0 -translate-x-3 -translate-y-1">
                    <div className="flex items-center sm:space-x-2 sm:mb-2 mb-0">
                      <motion.div
                        ref={titleRef}
                        onClick={handleTap}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-3xl ml-[7.5rem] sm:ml-[8.5rem] sm:text-4xl md:text-5xl font-germania tracking-normal text-green-800 dark:text-green-300 animate-glow tracker-title select-none"
                      >
                        A  
                        <span className="animated-co2 ml-1 inline-block text-[0.75em] align-sub" style={{ '--random': Math.random() }}> 1 </span> 
                        <span className="animated-co2 ml-1 inline-block text-[0.75em] align-sub" style={{ '--random': Math.random() }}> 4 </span>
                        <span className="animated-co2 ml-1 inline-block text-[0.75em] align-sub" style={{ '--random': Math.random() }}> 1 </span> 
                         
                      </motion.div>
                      <motion.div 
                        key="globe"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10" 
                      >
                        <Lottie animationData={GlobeAnimation} loop />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isHeaderExpanded && (
                        <motion.div
                          key="buttons"
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="flex space-x-2 -ml-1"
                        >
                          <HomeHeaderButton text="Login" iconType="verify" navigateTo="/login" />
                          <HomeHeaderButton text="Register" iconType="new" navigateTo="/register" />
                          <HomeHeaderButton text="Home" iconType="dashboard" navigateTo="/home" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.header>

                <AnimatedHeadline />
                <p className="text-base sm:text-xl font-intertight text-shadow-DEFAULT tracking-wide md:text-2xl text-emerald-500 dark:text-gray-100 max-w-3xl px-4">
                A full-stack MERN application empowering users to measure, track, and reduce their environmental impact</p>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-24 h-24 sm:w-32 sm:h-32"
                >
                  <Lottie animationData={GlobeAnimation} loop />
                </motion.div>
               <a
                href="mailto:carbontracker.noreply@gmail.com"
                onClick={handleEmailClick}
                target="_blank"
                rel="noopener noreferrer"
                title="Hey Man! Whats up Mr.Stark, Kid! Where did u come from?..."
                className="-mr-10 items-center font-intertight tracking-wide text-lg text-shadow-DEFAULT text-white hover:text-blue-500 transition-colors duration-300"
              >
                How<span className="animate-pulse">'</span>s your day going<span className="animate-pulse">? </span> Here<span className="animate-pulse">,</span> have a cookie 
                <span className="cookie-explode-wrapper">
                  <span className="cookie-main">🍪</span>
                  <span className="cookie-crumb cookie-crumb-1">🍪</span>
                  <span className="cookie-crumb cookie-crumb-2">🍪</span>
                  <span className="cookie-crumb cookie-crumb-3">🍪</span>
                  <span className="cookie-crumb cookie-crumb-4">🍪</span>
                </span>
              </a>
              </div>
                 <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: [10, 0, 10] }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm flex flex-col items-center z-20"
>
  <div className="scroll-indicator -ml-4">
  <Lottie
  animationData={ScrollDownAnimation}
  loop
  autoplay
  style={{ width: 40, height: 40 }}
/></div>
</motion.div>
            </motion.div>

            {/* StaggeredMenu - Always visible */}
            <StaggeredMenu
              items={menuItems}
              socialItems={socialItems}
              displaySocials={true}
              displayItemNumbering={true}
              accentColor="#10b981"
            />

            {/* Scrollable Content */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  key="about-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-32  max-w-5xl w-full z-10  pb-4"
                >
                    
                  {/* Project Philosophy Section */}
                  <motion.div 
                    ref={(el) => (sectionRefs.current[0] = el)}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="relative min-h-fit flex items-center justify-center py-6 mt-20 mb-20"
                  >
                    <div className="w-full">
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 
                      group-hover:opacity-100 animate-borderFlow 
                      border-emerald-500 dark:border-gray-100 pointer-events-none" />
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[-1] rounded-3xl" />
                      <div className="p-6 ">
                        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 justify-center">
                          <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                          <h2 className="text-4xl md:text-6xl font-bold font-germania text-shadow-DEFAULT tracking-wide text-emerald-500 dark:text-white text-center">
                            Project Philosophy
                          </h2>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed font-intertight text-shadow-DEFAULT text-emerald-500 dark:text-gray-300 mb-4">
    This project, officially named <span className="font-bold">CFT (Carbon Footprint Tracker)</span>, was conceived as a comprehensive deep dive into <span className="font-bold">full-stack application development</span>. The primary motivation was not just fun, but a rigorous, hands-on opportunity to achieve mastery over the entire <span className="font-bold">MERN (MongoDB, Express, React, Node.js)</span> stack and modern web architecture. This process involved architecting a robust and efficient <span className="font-bold">RESTful API</span> with <span className="font-bold">Express.js</span> and <span className="font-bold">Node.js</span> for backend logic, state management, and secure user authentication (e.g., using JWT). On the client-side, <span className="font-bold">React</span> was chosen to deliver a highly responsive and component-driven user experience (UX), likely utilizing a modern framework like <span className="font-bold">Tailwind CSS</span> for rapid, scalable styling.
</p>
<p className="text-sm sm:text-base leading-relaxed font-intertight text-shadow-DEFAULT text-emerald-500 dark:text-gray-300 mb-4">
    The development followed a strict ethos of <span className="font-bold">code ownership</span> and craftsmanship. While leveraging powerful resources—including open-source documentation and AI tools—for best practices and inspirational guidance, every critical feature and integration was meticulously built <span className="font-bold">from scratch</span> or thoroughly adapted. This intentional process prevented "blind copy-pasting," ensuring a profound, fundamental understanding of the code's mechanics and dependencies. The result is a genuinely <span className="font-bold">custom-engineered solution</span> that I can confidently maintain, debug, and seamlessly extend, demonstrating a professional commitment to technical rigor.
</p>
<p className="text-sm sm:text-base md:text-lg leading-relaxed font-intertight text-shadow-DEFAULT text-emerald-500 dark:text-gray-300">
    At its core, <span className="font-bold">CFT</span> is dedicated to democratizing meaningful climate action. The platform transforms the complex task of calculating one's <span className="font-bold">carbon footprint</span> into a straightforward, engaging experience through simple data entry and transparent, verifiable calculations. Beyond basic reporting, the application provides <span className="font-bold">personalized, actionable suggestions</span> for reduction and fosters community motivation through comparisons and leaderboards. Crucially, the entire application structure is built with <span className="font-bold">modularity and high scalability</span> in mind. By maintaining strict separation of concerns across the MERN layers, the foundation is future-proofed, allowing for the introduction of advanced reporting, new calculation modules, and third-party integrations without disrupting the existing system<AniDot />
</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Core Features Section */}
                  <motion.div 
                    ref={(el) => (sectionRefs.current[1] = el)}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="relative min-h-fit flex items-center justify-center py-6 "
                  >
                    <div className="w-full">
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[-1] rounded-3xl" />
                      <div className="p-6 ">
                        <h2 className="text-4xl md:text-6xl font-bold font-germania tracking-wide text-shadow-DEFAULT text-center mb-4 text-emerald-500 dark:text-white">
                          Core Features
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 font-intertight text-shadow-DEFAULT items-start">
                          {[
                            {
                              iconName: "Shield",
                              title: "Secure Authentication",
                              description: "Email verification via Nodemailer, HTTP-only cookies, bcrypt password hashing with zxcvbn validation",
                              details: [
                                "Secure cookie-based sessions",
                                "JWT token authentication with 3-day expiration",
                                "Rate limiting on login attempts (5 attempts per 15 minutes)",
                                "Redis-powered token blacklisting on logout",
                                "DOMPurify sanitization for all user inputs"
                              ]
                            },
                            {
                              iconName: "TrendingDown",
                              title: "Carbon Tracking",
                              description: "Log monthly lifestyle data across 4 categories: food, transport, electricity, and waste",
                              details: [
                                "Real-time CO₂ emission calculations using scientific emission factors",
                                "Smart input validation with realistic caps to prevent data anomalies",
                                "Category breakdown showing your biggest impact areas",
                                "Historical tracking with timestamp accuracy",
                                "Editable entries with full CRUD operations"
                              ]
                            },
                            {
                              iconName: "BarChart3",
                              title: "Interactive Dashboard",
                              description: "Beautiful visualizations powered by Recharts with dark mode support",
                              details: [
                                "Pie charts showing emission breakdown by category",
                                "Bar charts for community comparison",
                                "Framer Motion animations for smooth transitions",
                                "Lottie animations for enhanced user experience",
                                "Confetti celebrations for milestone achievements"
                              ]
                            },
                            {
                              iconName: "Users",
                              title: "Community Leaderboard",
                              description: "Compare your impact with other users and get motivated by community progress",
                              details: [
                                "Real-time rankings based on total emissions",
                                "Server-side aggregations for optimal performance",
                                "Excludes unverified or empty accounts",
                                "Privacy-focused: only usernames and emissions shown",
                                "MongoDB aggregation pipeline for efficient queries"
                              ]
                            },
                            {
                              iconName: "Zap",
                              title: "Performance Optimized",
                              description: "Redis caching, MongoDB indexing, and smart rate limiting for lightning-fast responses",
                              details: [
                                "Redis Cloud integration for sub-50ms cache responses",
                                "User profile caching with 30-minute TTL",
                                "Weather/AQI data caching with 30-minute refresh limits",
                                "MongoDB connection pooling and query optimization",
                                "Vercel Edge Network deployment for global speed"
                              ]
                            }
                          ].map((feature, idx) => {
  const Icon = getIcon(feature.iconName);
  // Create unique ID for each feature card
  const sectionId = `feature-${idx}`;
  const isExpanded = expandedSections[sectionId];
                            
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="bg-gray-800/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border min-h-[240px] border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                              >
                                <Icon className=" w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mb-3 sm:mb-4" />
                                <h3 className=" text-lg sm:text-xl font-bold mb-2 text-white">{feature.title}</h3>
                                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 flex-grow">{feature.description}</p>
                                
                                <button
                                  onClick={() => toggleSection(sectionId)}
                                  className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm hover:text-emerald-300 transition-colors"
                                >
                                  {isExpanded ? 'Show less' : 'Show details'}
                                  {isExpanded ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                                </button>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.ul
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="mt-3 sm:mt-4 space-y-2 overflow-hidden"
                                    >
                                      {feature.details.map((detail, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
                                          <span>{detail}</span>
                                        </li>
                                      ))}
                                    </motion.ul>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Technology Stack Section */}
                  <motion.div 
                    ref={(el) => (sectionRefs.current[2] = el)}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="relative min-h-fit flex items-center justify-center py-6"
                  >
                    <div className="w-full">
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[-1] rounded-3xl" />
                      <div className="p-6 ">
                        <h2 className="text-4xl md:text-6xl font-bold font-germania tracking-wide text-shadow-DEFAULT text-center mb-6 text-emerald-500 dark:text-white">
                          Technology Stack
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 font-intertight text-shadow-DEFAULT">
                          {[
                            {
                              category: "Frontend",
                              iconName: "Code",
                              technologies: [
                                { name: "React 18", purpose: "UI framework with hooks and context" },
                                { name: "Tailwind CSS", purpose: "Utility-first styling with dark mode" },
                                { name: "Framer Motion", purpose: "Smooth animations and transitions" },
                                { name: "Recharts", purpose: "Interactive data visualizations" },
                                { name: "Lottie React", purpose: "Lightweight animations" },
                                { name: "Axios", purpose: "HTTP client with cookie support" },
                                { name: "React Router v6", purpose: "Client-side routing" }
                              ]
                            },
                            {
                              category: "Backend",
                              iconName: "Layers",
                              technologies: [
                                { name: "Node.js", purpose: "JavaScript runtime" },
                                { name: "Express", purpose: "Web framework with middleware support" },
                                { name: "Mongoose", purpose: "MongoDB ODM with schema validation" },
                                { name: "JWT", purpose: "Stateless authentication tokens" },
                                { name: "Bcrypt", purpose: "Password hashing (12 rounds)" },
                                { name: "Nodemailer", purpose: "Email verification via Gmail SMTP" },
                                { name: "Redis", purpose: "Caching and rate limiting" }
                              ]
                            },
                            {
                              category: "Security",
                              iconName: "Lock",
                              technologies: [
                                { name: "Helmet", purpose: "Security headers middleware" },
                                { name: "CORS", purpose: "Cross-origin resource sharing" },
                                { name: "Express Rate Limit", purpose: "DDoS protection" },
                                { name: "Mongo Sanitize", purpose: "NoSQL injection prevention" },
                                { name: "XSS Clean", purpose: "XSS attack prevention" },
                                { name: "HPP", purpose: "HTTP parameter pollution protection" },
                                { name: "DOMPurify", purpose: "Client-side HTML sanitization" }
                              ]
                            },
                            {
                              category: "Infrastructure",
                              iconName: "Cloud",
                              technologies: [
                                { name: "Vercel", purpose: "Frontend hosting with CDN" },
                                { name: "Render", purpose: "Backend hosting with auto-scaling" },
                                { name: "MongoDB Atlas", purpose: "Cloud database with encryption" },
                                { name: "Redis Cloud", purpose: "Managed Redis instance" },
                                { name: "Gmail SMTP", purpose: "Email delivery service" },
                                { name: "Vercel Proxy", purpose: "API route forwarding" }
                              ]
                            }
                          ].map((stack, idx) => {
                            const Icon = getIcon(stack.iconName);
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15, duration: 0.6 }}
                                className="bg-gray-800/70 rounded-3xl p-4 sm:p-6 border border-emerald-500/20 max-h-[300px]"
                              >
                                <div className="flex items-center gap-2 sm:gap-2 mb-4">
                                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                                  <h3 className="text-xl sm:text-2xl font-bold text-white">{stack.category}</h3>
                                </div>
                                <div className="space-y-1">
                                  {stack.technologies.map((tech, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                                      <span className="font-semibold text-white text-sm sm:text-base">{tech.name}</span>
                                      <span className="text-xs sm:text-sm text-gray-400 sm:text-right">{tech.purpose}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* API Endpoints Section */}
                  <motion.div 
                    ref={(el) => (sectionRefs.current[3] = el)}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="relative min-h-fit flex items-center justify-center py-6 mb-24"
                  >
                    <div className="w-full">
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[-1] rounded-3xl" />
                      <div className="p-6 ">
                        <h2 className="text-4xl md:text-6xl font-bold font-germania tracking-wide text-shadow-DEFAULT text-center mb-6 text-emerald-500 dark:text-white">
                          API Endpoints
                        </h2>
                        <div className="space-y-6 font-intertight text-shadow-DEFAULT tracking-wide">
                          {[
                            {
                              category: "Authentication",
                              endpoints: [
                                { method: "POST", path: "/api/auth/register", desc: "Register new user with email verification" },
                                { method: "POST", path: "/api/auth/login", desc: "Login with rate limiting" },
                                { method: "GET", path: "/api/auth/verify-email/:token", desc: "Verify email with JWT token" },
                                { method: "GET", path: "/api/auth/weather-aqi", desc: "Get weather and air quality data" }
                              ]
                            },
                            {
                              category: "Carbon Footprint",
                              endpoints: [
                                { method: "POST", path: "/api/footprint", desc: "Create new carbon entry" },
                                { method: "GET", path: "/api/footprint/history", desc: "Get all user entries" },
                                { method: "PUT", path: "/api/footprint/:id", desc: "Update specific entry" },
                                { method: "DELETE", path: "/api/footprint/:id", desc: "Delete specific entry" }
                              ]
                            }
                          ].map((group, idx) => (
                            <div key={idx} className="bg-gray-900/80 rounded-3xl p-4 sm:p-6 border border-emerald-500/30 ">
                              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">{group.category}</h3>
                              <div className="space-y-2 sm:space-y-3">
                                {group.endpoints.map((endpoint, i) => (
                                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-3 bg-black/40 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-intertight text-shadow-DEFAULT tracking-wide text-xs px-2 py-1 rounded ${
                                        endpoint.method === 'GET' ? 'bg-blue-600' : 
                                        endpoint.method === 'POST' ? 'bg-emerald-600' : 
                                        endpoint.method === 'PUT' ? 'bg-yellow-600' :
                                        'bg-red-600'
                                      }`}>
                                        {endpoint.method}
                                      </span>
                                      <code className="text-xs sm:text-sm text-emerald-400 break-all font-intertight text-shadow-DEFAULT tracking-wide">{endpoint.path}</code>
                                    </div>
                                    <span className="text-xs font-intertight text-shadow-DEFAULT tracking-wide sm:text-sm text-gray-400">{endpoint.desc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Security Features Section */}
                  <motion.div 
                    ref={(el) => (sectionRefs.current[4] = el)}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="relative min-h-fit flex items-center justify-center py-6 mb-24"
                  >
                    <div className="w-full">
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[-1] rounded-3xl" />
                      <div className="p-6 sm:p-8 md:p-12">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                          <h2 className="text-4xl md:text-6xl font-bold font-germania tracking-wide text-shadow-DEFAULT text-emerald-500 dark:text-white text-center">
                            Security Features
                          </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 font-intertight text-shadow-DEFAULT">
                          {[
                            "HTTP-only cookies with SameSite=None for cross-domain",
                            "Redis token blacklisting on logout",
                            "Rate limiting: 5 login attempts/15min, 3 feedback/hour",
                            "User profile caching with automatic invalidation",
                            "CORS configured for Vercel domains only",
                            "Helmet middleware for security headers",
                            "MongoDB injection prevention with express-mongo-sanitize",
                            "XSS protection with xss-clean and DOMPurify",
                            "Password strength validation with zxcvbn",
                            "Input validation caps to prevent unrealistic data",
                            "JWT secret rotation support",
                            "Environment variable protection (.env not committed)"
                          ].map((feature, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05, duration: 0.4 }}
                              className="flex items-start gap-2 sm:gap-3 bg-gray-800/70 p-3 sm:p-4 rounded-lg border border-emerald-500/20"
                            >
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Footer Section */}
                  <motion.div 
                    ref={(el) => (sectionRefs.current[5] = el)}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="relative pb-2 min-h-fit flex items-center justify-center py-6 "
                  >
                    <div className="w-full">
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[-1] rounded-3xl" />
                      <div className="p-4 text-center">
                        <h2 className="font-germania text-4xl md:text-6xl text-shadow-DEFAULT tracking-wide">Conclusion</h2>
<p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 font-intertight text-shadow-DEFAULT">
   <br /> Built with passion for the environment, <span className="font-bold text-shadow-glow">Carbon Footprint Tracker</span> is fundamentally an application designed for continuous improvement and real-world impact<AniDot /><br /><br /> The current iteration serves as a robust foundation, but the journey of development is ongoing. I am actively dedicated to refining calculations, enhancing data visualization for a richer user experience, and optimizing the MERN stack architecture for even greater speed and reliability. Most importantly, this project's evolution is driven by its users: I am constantly monitoring and analyzing feedback—which you can easily provide via the dedicated link on the homepage—to inform priority fixes and feature implementations.
</p>
<p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 font-intertight text-shadow-DEFAULT">
    Looking ahead, the roadmap includes several key features to deepen its functionality. Future additions are planned to include tracking non-CO₂ greenhouse gases (like Methane and Nitrous Oxide), integrating optional API access for utility data, and developing more personalized, goal-oriented carbon reduction plans. This project stands as a testament to practical skill development and a contribution to the global dialogue on climate change. To appreciate the scale of the challenge CFT addresses, explore the latest global emissions data from these authoritative sources<span className="animate-pulse">:</span>
</p>
<div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm mb-3 sm:mb-4">
    <a href="https://www.globalcarbonproject.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline font-intertight text-shadow-DEFAULT tracking-wide">Global Carbon Project</a>
    <a href="https://edgar.jrc.ec.europa.eu/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline font-intertight text-shadow-DEFAULT tracking-wide">EDGAR Emissions Database</a>
    <a href="https://ourworldindata.org/co2-emissions" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline font-intertight text-shadow-DEFAULT tracking-wide">Our World in Data: CO₂</a>
    <a href="https://www.un.org/en/climatechange/reports" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline font-intertight text-shadow-DEFAULT tracking-wide">UN Climate Reports</a>
    <a href="https://www.ipcc.ch/reports/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline font-intertight text-shadow-DEFAULT tracking-wide">IPCC Reports</a>
</div>
                      </div>
                    </div>
                  </motion.div>

                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </PageWrapper>
    </motion.div>
  );
};

export default AboutPage;