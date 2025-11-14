import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import { HomeHeaderButton } from './globalbuttons';
import Lottie from 'lottie-react';
import GlobeAnimation from 'animations/Globe.json';
import ScrollDownAnimation from 'animations/ScrollDown.json';
import { useNavigate } from 'react-router-dom';
import { MdEmail } from "react-icons/md";
import { boxglowD, boxglowH } from 'utils/styles';
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
  
  const AnimatedHeadline = () => {
    const [activeBurstIndex, setActiveBurstIndex] = useState(null);
    const [bursting, setBursting] = useState(false);
    const [fallingLetters, setFallingLetters] = useState([]);
  
    // useEffect(() => {
    //   const allChars = sentence.replace(/\s/g, "").length;
  
    //   const interval = setInterval(() => {
    //     const indices = Array.from({ length: allChars }, (_, i) => i);
    //     const shuffled = shuffleArray(indices).slice(0, Math.floor(Math.random() * 5) + 3); // 3–7 letters
  
    //     setFallingLetters((prev) => [...prev, ...shuffled]);
  
    //     setTimeout(() => {
    //       setFallingLetters((prev) => prev.filter((i) => !shuffled.includes(i)));
    //     }, 3000);
    //   }, 4000); // pause for 4s
  
    //   return () => clearInterval(interval);
    // }, []);
  
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
          className="flex flex-wrap justify-center gap-2 text-5xl sm:text-6xl md:text-8xl font-black font-germania tracking-wider text-shadow-DEFAULT text-white transition-colors duration-500"
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
              className="relative sm:mr-2 inline-block cursor-pointer"
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

const AniDot = () => (
  <span aria-hidden="true" className="inline-flex items-center">
    <motion.span
      className="inline-block text-lg font-normal sm:font-semibold ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
    > 
      .
    </motion.span>
    <motion.span
      className="inline-block text-lg font-normal sm:font-semibold ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
    >
      .
    </motion.span>
    <motion.span
      className="inline-block text-lg font-normal sm:font-semibold ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
    >
      .
    </motion.span>
  </span>
);

const Home = () => {
  const titleRef = useRef(null);
  const [showContent, setShowContent] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const navigate = useNavigate();
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
  const pingServer = async () => {
    try {
      const response = await fetch(`https://api.carbonft.app/api/auth/ping?ts=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Server returned non-JSON response:', await response.text());
        return;
      }
      
      const data = await response.json();
      console.log('✅ Ping success:', data.message);
    } catch (err) {
      console.error('⚠️ Ping failed:', err);
    }
  };
  
  pingServer();
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
  const contentVariants = {
  hidden: { opacity: 0, y: -10, transition: { duration: 0.2, delay: 0.6 } }, // exit
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.8 } }, // entry
};
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
const subject = encodeURIComponent("Feedback on Carbon Footprint Tracker");
const handleEmailClick = (e) => {
  if (!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    e.preventDefault();
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=carbontracker.noreply@gmail.com&su=${subject}`,
      '_blank'
    );
  }
};

  return (
    <motion.div
            initial={{ x:100, opacity: 0}}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="w-full h-full"
          >
    <PageWrapper backgroundImage="/images/home-bk.webp">
      <div className="w-full min-h-screen flex flex-col  text-gray-100 transition-colors duration-500 px-6 py-6">
        {/* Header */}
       <motion.header
  initial={false}
  animate={{ height: isHeaderExpanded ? screenHeight.expanded : screenHeight.collapsed }}
  transition={{ duration: 0.5, ease: 'easeInOut' }}
  className={`${boxglowH} w-full fixed top-0 left-0 z-40 px-6 py-4
    bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all duration-500`}
>
  
<div className="transform sm:translate-x-0 sm:translate-y-0 -translate-x-3 -translate-y-1">

  <div className="flex items-center sm:space-x-2 sm:mb-2 mb-0">
  <motion.div
    ref={titleRef}
    onClick={handleTap}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="text-2xl sm:text-4xl md:text-5xl font-germania tracking-normal text-sky-400 dark:text-green-300 tracker-title select-none"
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
        <HomeHeaderButton text="About" iconType="info" navigateTo="/about" className="hidden sm:inline-flex"/>
      </motion.div>
    )}
  </AnimatePresence>
</div>
</motion.header>

    {/* Main Section yaha se */}
    <section className="relative flex-1 flex flex-col justify-center items-center px-6 py-4 text-center min-h-screen ">
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
      <div
  className="
    w-10 h-10
    transition-all duration-500
    filter
    dark:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(32%)_saturate(1234%)_hue-rotate(84deg)_brightness(95%)_contrast(92%)]
    [filter:brightness(0)_saturate(100%)_invert(61%)_sepia(92%)_saturate(2103%)_hue-rotate(174deg)_brightness(103%)_contrast(102%)]
  "
>
  <Lottie animationData={ScrollDownAnimation} loop autoplay />
</div>
</div></button>
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
    <div className={`${boxglowD} absolute inset-0 bg-black/50 backdrop-blur-sm z-[-1] rounded-3xl`} />

    <motion.div className="text-white text-shadow-DEFAULT font-intertight text-center max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8 space-y-6" variants={containerVariants} initial="hidden" animate="visible">
    
    {/* Heading */}
    <motion.h2 variants={itemVariants} className="sm:text-4xl md:text-5xl text-3xl font-germania tracking-wider font-bold text-sky-400 dark:text-gray-100">
    What<span class="quantum-quote">'</span>s Your Carbon Impact <span class="curious-mark -ml-1">?</span>
    </motion.h2>

    {/* Full version for tablets and up */}
    <motion.p variants={itemVariants} className="hidden sm:block text-base md:text-lg leading-relaxed  text-gray-100"><br />
    Let’s find out — not by guessing, but by discovering your real <span className="font-semibold">Carbon Footprint</span> based on how you actually live<AniDot />
    </motion.p>

    <motion.p variants={itemVariants}  className="hidden sm:block text-base md:text-lg leading-relaxed  text-gray-100"> <span className="animate-plane-fly">✈️</span> How you <span className="font-medium">Travel</span>, <span class="electric-plug">🔌</span> the <span className="font-medium">Energy</span> you use, <span className="shiny-plate">🍽️</span> what you <span className="font-medium">Eat</span>, <span class="clean-bin">🗑️</span> what you <span className="font-medium">Waste</span> — it all adds up.
    </motion.p>
    <motion.p variants={itemVariants} className="hidden sm:block text-base md:text-lg leading-relaxed  text-gray-100" >
    Our tracker turns your habits into <span className="font-semibold">easy-to-read</span> visuals, shows your yearly footprint, and helps you see how you’re doing <span className="font-semibold">compared</span> to others <span className="animate-earth-spin"><span>🌎</span></span>
    </motion.p>
    <motion.p variants={itemVariants} className="hidden sm:block text-base md:text-lg leading-relaxed  text-gray-100" >
    <span className="font-medium">Ready to see your impact<span className="mini-curious">?</span></span> Tap the <span>"</span><span className="font-semibold text-sky-400 dark:text-green-300">Carbon Footprint Tracker</span><span>"</span> above to
    <span onClick={() => navigate('/register')} className="underline ml-1 decoration-emerald-500/50 hover:decoration-emerald-500 hover:text-emerald-400 cursor-pointer transition-all duration-500 ease-out hover:translate-y-[-2px] inline-block"> Register</span> or 
    <span onClick={() => navigate('/login')} className="underline ml-1 decoration-emerald-500/50 hover:decoration-emerald-500 hover:text-emerald-400 cursor-pointer transition-all duration-500 ease-out hover:translate-y-[-2px] inline-block"> Login</span> and start your journey.<br />
    <span className="italic font-medium text-base md:text-lg leading-relaxed text-yellow-300">
    P.S. Stay in dark mode for the best experience.
    </span>
    </motion.p>

    {/* Compact version for mobile */}
    <motion.p variants={itemVariants} className="sm:hidden text-sm leading-relaxed  text-gray-100">
    Discover your real carbon footprint <span className="animate-pulse">—</span> from travel<span className="animate-pulse">✈️</span> to food<span className="animate-pulse">🍽️</span>. Track your impact and compare progress visually<AniDot />
    </motion.p>
    <motion.p variants={itemVariants} className="sm:hidden text-sm leading-relaxed  text-gray-100">
    Tap <span className="animate-pulse">"</span><span className="font-semibold text-sky-400 dark:text-green-300">Carbon Footprint Tracker</span><span className="animate-pulse">"</span> heading above to <span onClick={() => navigate('/register')} className="underline decoration-emerald-500/50 hover:decoration-emerald-500 cursor-pointer transition-all duration-500 ease-out hover:translate-y-[-1px] active:translate-y-[1px] active:text-emerald-300 active:scale-95 inline-block">Register</span> or <span onClick={() => navigate('/login')} className="underline decoration-emerald-500/50 hover:decoration-emerald-500 cursor-pointer transition-all duration-500 ease-out hover:translate-y-[-1px] active:translate-y-[1px] active:text-emerald-300 active:scale-95 inline-block">Log In</span>.
    <br />  <span className="italic text-sm leading-relaxed text-yellow-300">
    P.S. Dark mode + laptop = best experience. <span className="animate-star">✮⋆˙</span>
    </span>
    </motion.p> 

    {/* Feedback Email */}
    <motion.p variants={feedbackVariants} className="text-sm md:text-base  text-gray-100">
    Tell us what you think!
    {/* <span className="exclaim">!</span> */}
    {' '}
    <a
    href={`mailto:carbontracker.noreply@gmail.com?subject=${subject}`}
    onClick={handleEmailClick}
    target="_blank"
    rel="noopener noreferrer"
    className="items-center gap-1 underline decoration-blue-500/50 hover:decoration-blue-500 text-blue-300 hover:text-blue-500 cursor-pointer transition-all duration-500 ease-out hover:translate-y-[-2px] inline-flex"
    >
    <span className="leading-none mt-1">your feedback is welcome</span>
        <motion.div
    className="inline-block"
    animate={{
      y: [0, -3, 0, -2, 0],
      rotate: [0, -5, 0, 5, 0]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
  <MdEmail className="text-base relative top-[2.5px]" />
  </motion.div>
    </a>.
<p className=" text-xs sm:text-base text-center font-intertight text-shadow-DEFAULT tracking-wide text-gray-600 dark:text-gray-100">
    By registering, you agree to our{' '}
    <a
      href="https://carbonft.app/privacypolicy.html"
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-emerald-500/50 hover:decoration-emerald-500 text-emerald-300 hover:text-emerald-500 cursor-pointer transition-all duration-500 ease-out hover:translate-y-[-2px] inline-block"
    >
      Privacy Policy🔒
      {/* <span className="emoji privacy">🔒</span> */}
    </a>{' '}
    and{' '}
    <a
      href="https://carbonft.app/termsofservice.html"
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-emerald-500/50 hover:decoration-emerald-500 text-emerald-300 hover:text-emerald-500 cursor-pointer transition-all duration-500 ease-out hover:translate-y-[-2px] inline-block"
    >
      Terms📄
      {/* <span className="emoji terms">📄</span> */}
    </a>.
    </p>
</motion.p>
</motion.div>
</div>
</motion.div>
)}
</AnimatePresence>
</section>
</div>
</PageWrapper>
</motion.div>
);
};


export default Home;
