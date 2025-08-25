import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, easeOut, motion } from 'framer-motion';
import { useLoading } from 'context/LoadingContext';
import PageWrapper from 'common/PageWrapper';
import { HomeHeaderButton } from './globalbuttons';
import Lottie from 'lottie-react';
import GlobeAnimation from 'animations/Globe.json';
import ScrollDownAnimation from 'animations/ScrollDown.json';
import appVersion from '../version.json';
import { MdEmail } from "react-icons/md";
  const sentence = "Your  Carbon  Story";
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
  
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  const AnimatedHeadline = () => {
    const [activeBurstIndex, setActiveBurstIndex] = useState(null);
    const [bursting, setBursting] = useState(false);
    const [fallingLetters, setFallingLetters] = useState([]);
  
    useEffect(() => {
      const allChars = sentence.replace(/\s/g, "").length;
  
      const interval = setInterval(() => {
        const indices = Array.from({ length: allChars }, (_, i) => i);
        const shuffled = shuffleArray(indices).slice(0, Math.floor(Math.random() * 5) + 3); // 3–7 letters
  
        setFallingLetters((prev) => [...prev, ...shuffled]);
  
        setTimeout(() => {
          setFallingLetters((prev) => prev.filter((i) => !shuffled.includes(i)));
        }, 3000);
      }, 4000); // pause for 4s
  
      return () => clearInterval(interval);
    }, []);
  
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
          className="flex flex-wrap justify-center gap-2 text-5xl sm:text-6xl md:text-8xl font-black font-germania tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
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
              className="relative inline-block cursor-pointer"
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
                      {/* Confetti burst */}
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
const Home = () => {
  const titleRef = useRef(null);
  const [showContent, setShowContent] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const contentVariants = {
  hidden: { opacity: 0, y: -10, transition: { duration: 0.2, delay: 0.6 } }, // exit
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.8 } }, // entry
};
const [screenHeight, setScreenHeight] = useState({ collapsed: 70, expanded: 110 });
useEffect(() => {
  const handleScroll = () => {
    const scrollTop = window.scrollY;

    if (scrollTop > 50) {
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
useEffect(() => {
  const updateHeight = () => {
    const width = window.innerWidth;
    if (width < 640) setScreenHeight({ collapsed: 70, expanded: 85 }); // mobile
    else if (width < 768) setScreenHeight({ collapsed: 75, expanded: 115 }); // tablet
    else if (width < 1024) setScreenHeight({ collapsed: 80, expanded: 120 }); // small desktop
    else setScreenHeight({ collapsed: 90, expanded: 130 }); // large desktop
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


const handleTap = () => {
  setIsHeaderExpanded(prev => !prev); // Toggle expanded state
  if (navigator.vibrate) {
    navigator.vibrate(10); // Mobile haptic feedback
  }
};
const isMobile = window.innerWidth < 640;
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isMobile ? 0.1 : 0.4,
      delayChildren: 0.6,
    },
  },
  exit: { opacity: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
    ease: "easeOut"
  },
};
const feedbackVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: isMobile ? 1.6 : 2.6 },
    ease: "easeOut"
  },
};

const handleEmailClick = (e) => {
  if (!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    e.preventDefault();
    window.open(
      'https://mail.google.com/mail/?view=cm&fs=1&to=carbontracker.noreply@gmail.com&su=Feedback%20on%20Carbon%20Tracker',
      '_blank'
    );
  }
};
const [scrollingUp, setScrollingUp] = useState(false);

useEffect(() => {
  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY < lastScrollY) {
      setScrollingUp(true);
    } else {
      setScrollingUp(false);
    }
    lastScrollY = currentScrollY;
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <motion.div
            initial={{ x:100, opacity: 0}}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="w-full h-full"
          >
    <PageWrapper backgroundImage="/images/home-bk.webp">
      <div className="w-full min-h-screen flex flex-col text-emerald-500 dark:text-gray-100 transition-colors duration-500 px-6 py-6">
        {/* Header */}
       <motion.header
  initial={false}
  animate={{ height: isHeaderExpanded ? screenHeight.expanded : screenHeight.collapsed }}
  transition={{ duration: 0.5, ease: 'easeInOut' }}
  className={`w-full fixed top-0 left-0 z-40 px-6 py-4
    bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all duration-500`}
>
  
<div className="transform sm:translate-x-0 sm:translate-y-0 -translate-x-3 -translate-y-1">

  <div className="flex items-center sm:space-x-2 sm:mb-2 mb-0">
  <motion.div
    ref={titleRef}
    onClick={handleTap}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="text-2xl sm:text-4xl md:text-5xl font-germania tracking-normal text-green-800 dark:text-green-300 animate-glow tracker-title select-none"
  >
    Carbon Footprint Tracker
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
        className="flex space-x-2"
      >
        <HomeHeaderButton text="Login" iconType="verify" navigateTo="/login" />
        <HomeHeaderButton text="Register" iconType="new" navigateTo="/register" />
      </motion.div>
    )}
  </AnimatePresence>
</div>
</motion.header>

        {/* Main Section */}
        <section className="relative flex-1 flex flex-col justify-center items-center px-6 py-10 text-center min-h-screen ">
  {/* Heading */}
  <motion.div
    initial={{ opacity: 1, y: 0 }}
    animate={showContent ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    className="fixed inset-0 flex items-center justify-center z-0"
  >
   <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: [10, 0, 10] }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm flex flex-col items-center z-20"
><button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
  <div className="scroll-indicator -ml-4">
  <Lottie
  animationData={ScrollDownAnimation}
  loop
  autoplay
  style={{ width: 40, height: 40 }}
/></div></button>
</motion.div>

    <AnimatedHeadline />
  </motion.div>

  {/* Paragraph */}
  <AnimatePresence>
  {showContent && (
    <motion.div
      key="bottom-text"
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="sm:mt-52 mt-44 -mb-7 max-w-2xl text-center z-10"
    >
  <div className="flex flex-grow justify-center items-center relative z-10">
  {/* Background overlay to improve visibility */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[-1] rounded-3xl" />

  <motion.div className="text-white text-shadow-DEFAULT font-intertight text-center max-w-4xl mx-auto px-4 py-12 space-y-6" variants={containerVariants} initial="hidden" animate="visible">
    
    {/* Heading */}
    <motion.h2
            variants={itemVariants} className="sm:text-4xl md:text-5xl text-3xl font-germania tracking-wider font-bold text-emerald-500 dark:text-gray-100">
      What<span className="animate-pulse">'</span>s Your Carbon Impact<span className="animate-pulse">?</span>
    </motion.h2>

    {/* Full version for tablets and up */}
    <motion.p
            variants={itemVariants} className="hidden sm:block text-base md:text-lg leading-relaxed text-emerald-500 dark:text-gray-100"><br />
      Go beyond guessing — <span className="font-semibold">discover your true carbon footprint</span> based on your real lifestyle.
      </motion.p>
       <motion.p
            variants={itemVariants}
            className="hidden sm:block text-base md:text-lg leading-relaxed text-emerald-500 dark:text-gray-100"
          >
      
      <span className="animate-pulse">✈️</span> <span className="font-medium">Travel</span>, <span className="animate-pulse">🔌</span> <span className="font-medium">electricity use</span>, <span className="animate-pulse">🍽️</span> <span className="font-medium">daily meals</span> — it all adds up.
      </motion.p>
      <motion.p
            variants={itemVariants}
            className="hidden sm:block text-base md:text-lg leading-relaxed text-emerald-500 dark:text-gray-100"
          >
      Our tracker gives you <span className="font-semibold">clear visual insights</span> into your impact, 
      projects your yearly footprint, 
      and helps you <span className="font-semibold">compare your progress</span> with the community.
      </motion.p>
      <motion.p
            variants={itemVariants}
            className="hidden sm:block text-base md:text-lg leading-relaxed text-emerald-500 dark:text-gray-100"
          >
      
      <span className="font-medium">Ready to begin?</span> Tap the <span className="font-semibold text-green-800 dark:text-green-300 animate-glow"><span className="animate-pulse">"</span>Carbon Footprint Tracker<span className="animate-pulse">"</span></span> heading above to <Link to="/register" className="underline">Register</Link> or <Link to="/login" className="underline">Log In</Link>.
    </motion.p>

    {/* Compact version for mobile */}
     <motion.p
            variants={itemVariants}
 className="sm:hidden text-sm leading-relaxed text-emerald-500 dark:text-gray-100">
      Discover your real carbon footprint <span className="animate-pulse">—</span> from travel<span className="animate-pulse">✈️</span> to food<span className="animate-pulse">🍽️</span>. Track your impact and compare progress visually.
      </motion.p>
      <motion.p
            variants={itemVariants}
 className="sm:hidden text-sm leading-relaxed text-emerald-500 dark:text-gray-100">
      Tap <span className="font-semibold text-green-800 dark:text-green-300 animate-glow"><span className="animate-pulse">"</span>Carbon Footprint Tracker<span className="animate-pulse">"</span></span> above to <Link to="/register" className="underline">Register</Link> or <Link to="/login" className="underline">Log In</Link>.
    </motion.p> 

    {/* Feedback Email */}
<motion.p variants={feedbackVariants} className="text-sm md:text-base text-emerald-500 dark:text-gray-100">
  Your experience is important<span className="animate-pulse font-extrabold">!</span> It would be a great help if you could email your valuable feedback to{' '}
  <a
    href="mailto:carbontracker.noreply@gmail.com?subject=Feedback%20on%20Carbon%20Tracker"
    onClick={handleEmailClick}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 underline text-blue-300 hover:text-blue-500 transition-colors duration-200"
  >
    <MdEmail className="text-base relative top-[2.5px] animate-pulse" />
    <span className="leading-none mt-1">carbontracker.noreply@gmail.com</span>
  </a>
</motion.p>
  </motion.div>
</div>

</motion.div>
)}
 </AnimatePresence>
</section>
{/* Footer */}
      <AnimatePresence>
  {!scrollingUp && (
    <motion.footer
      key="footer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-0 left-0 w-full font-bespoke text-center text-lg italic py-4 text-emerald-700 dark:text-white backdrop-blur-md"
    >
      Carbon down. Future up. v {appVersion.version}
    </motion.footer>
  )}
</AnimatePresence>


      </div>
    </PageWrapper>
    </motion.div>
  );
};


export default Home;
