import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { motion, useAnimation } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import { AnimatePresence } from 'framer-motion';
import useAuthRedirect from 'hooks/useAuthRedirect';
import API from 'api/api';
import { NewEntryButton, EditDeleteButton, LogoutButton, VisualizeButton, FeedbackButton} from 'Components/globalbuttons';
import { useLoading } from 'context/LoadingContext';
import CardNav from 'Components/CardNav';  
import LottieLogo from 'Components/LottieLogoComponent';
import FirstTimeWelcome from './FirstTimeWelcome';
  const sentence = "Your Climate Dashboard";
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
const triggerConfetti = (element) => {
  if (!element) return;

  for (let i = 0; i < 8; i++) {
    const conf = document.createElement('span');
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F43F5E', '#22D3EE'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    conf.className = 'absolute w-1.5 h-1.5 rounded-full pointer-events-none';
    conf.style.backgroundColor = randomColor;
    conf.style.left = '50%';
    conf.style.top = '50%';
    conf.style.position = 'absolute';

    const x = `${Math.random() * 60 - 30}px`;
    const y = `${Math.random() * 60 - 30}px`;
    conf.style.setProperty('--x', x);
    conf.style.setProperty('--y', y);
    conf.style.animation = `confetti-burst 600ms ease-out forwards`;

    element.appendChild(conf);
    setTimeout(() => conf.remove(), 700);
  }
};
const AnimatedHeadline = React.memo(() => {
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
    <div className="relative -mt-3 overflow-visible w-full flex justify-center items-center px-4">
      <motion.div
        className="flex flex-wrap justify-center gap-3 text-4xl sm:text-6xl md:text-8xl font-black font-germania tracking-widest text-shadow-DEFAULT text-white transition-colors duration-500"
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
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                  animate={
                    isBursting
                      ? {
                          x: Math.random() * 80 - 40,
                          y: Math.random() * 60 - 30,
                          rotate: Math.random() * 180 - 90,
                          opacity: [1, 0],
                          scale: [1, 1.2, 0.4],
                          transition: { duration: 0.8, delay: randomDelay, ease: "easeOut" },
                        }
                      : fallingLetters.includes(charIndex)
                      ? "reenter"
                      : "initial"
                  }
                  variants={getLetterVariants()}
                >
                  
                  {char === "o" && wordIndex === 2 ? (
              <>
                {/* Mobile: show 'o' */}
                <span className="block">{char}</span>

                {/* sm+ screens: animated earth 
                <span className="hidden sm:inline-block">
                  <span className="earth-space">🌎<span></span><span></span><span></span><span></span><span></span></span>
                </span>*/}
              </>
            ) : (
              char
            )}
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
});
const FootprintPulseCard = ({ level = "medium" }) => {
  const config = {
    low:    { glow: "emerald", duration: 8 },
    medium: { glow: "amber", duration: 6 },
    high:   { glow: "red", duration: 4.5 }
  }[level];

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="relative bg-gray-800/70 backdrop-blur-xl 
                      rounded-3xl px-8 py-10 
                      shadow-lg max-w-5xl w-full text-center">

        {/* Planet */}
        <span className="mx-auto w-32 h-32 
                     rounded-full flex items-center justify-center
                     text-5xl sm:text-6xl bg-black/20">
                  <span className="earth-space">🌎<span></span><span></span><span></span><span></span><span></span></span>
                </span>
        

        {/* Desktop pulse wave */}
        <div className="hidden sm:flex justify-center mt-6 opacity-50">
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-[2px] w-80 bg-gradient-to-r 
                       from-transparent via-white/60 to-transparent"
          />
        </div>

        {/* Tagline */}
        <p className="mt-6 text-base sm:text-lg 
                      text-white font-intertight tracking-wide text-shadow-DEFAULT">
          Your footprint has a pulse.
        </p>
        <p className=" text-sm
                      text-white/80 font-intertight tracking-wide text-shadow-DEFAULT">
         Everyday actions add up — even when we don’t see them.
We help you measure your carbon footprint and explore simple ways to reduce it.
        </p>
      </div>
    </div>
  );
};
  const Dashboard = () => {
  useAuthRedirect(); 
  const [data, setData] = useState([]);
  const { loading } = useLoading();
  const [openSection, setOpenSection] = useState(null);
  const [version] = useState(0);
  const [showLimitMsg, setShowLimitMsg] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [logoutSuccess, setLogoutSuccess] = useState('');
  const shimmerControls = useAnimation();
  const historySectionRefs = useRef([]);
  const infoSectionRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate(); 
  const bottomRef = useRef(null);
  const topRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = window.innerWidth < 640; 
  const [user, setUser] = useState(() => {
  const cachedName = sessionStorage.getItem('userName');
  return cachedName ? { name: cachedName } : null;
});
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/token-info/me');
      setUser(res.data);
      sessionStorage.setItem('userName', res.data.name);
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      setUser(null);
    }
  };

  fetchUser();
}, []);

const fetchHistory = async () => {
  try {
    const res = await API.get('/footprint/history');
    const result = res.data;
    const allEntries = Array.isArray(result) ? result : result.history || [];
    const sortedData = allEntries
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);

    setData(sortedData);
    setShowLimitMsg(allEntries.length >= 5);
    window.entriesCount = allEntries.length;
window.showLimitMessage = (force = false) => {
  if (force) {
    setShowLimitMsg(false);
    setTimeout(() => {
      setShowLimitMsg(true);
      setTimeout(() => {
        if (topRef.current) {
          topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 50);
  } else {
    setShowLimitMsg(true);
    setTimeout(() => {
      if (topRef.current) {
  topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    let i = 0;
    const interval = setInterval(() => {
      const offset = (i % 2 === 0 ? -20 : 20) / (i + 1); // diminishing shake
      window.scrollBy(0, offset);
      if (++i > 4) clearInterval(interval);
    }, 60);
  }, 500);
}
    }, 100);
  }
};

  } catch (err) {
    console.error('Error fetching data:', err);
    setData([]);
  } 
};

  useEffect(() => {
    fetchHistory();
  }, [version]);

 useEffect(() => {
  if (location.state?.updated) {
    fetchHistory();
    window.history.replaceState({}, document.title);
  }
}, [location.state?.updated]);

useEffect(() => {
  if (data.length > 0) {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0; 
      document.body.scrollTop = 0;            
    });
  }
}, [data]);

 const handleLogout = async () => {
  setLogoutError('');
  setLogoutSuccess('');
  setLogoutLoading(true);

  try {
    // Ask server to clear the cookie
    await API.post('/auth/logout');

    // Clear mobile/PC fallback session token
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('justVerified');
    setLogoutSuccess('✌ Logged out');

    setTimeout(() => {
      navigate('/home');
    }, 600);
  } catch (err) {
    console.error('Logout error:', err);
    setLogoutError('❌ Logout failed');
  } finally {
    setLogoutLoading(false);
  }
};

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
    isMounted = false; // stop loop on unmount
  };
}, [shimmerControls]);

 infoSectionRefs.current.length = 0;
 historySectionRefs.current.length = 0;

  return (
    <motion.div
            initial={{ x:100, opacity: 0}}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="w-full h-full"
          >
    <PageWrapper backgroundImage="/images/dashboard-bk.webp">
    <div ref={topRef}></div>
<div className="w-auto px-0">
  <CardNav
    logo={<LottieLogo isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />}
    logoAlt="Animated Menu"
    menuColor="bg-white/20 dark:bg-gray-800/70"
    logoSize="w-25 h-25"
    isMenuOpen={isMenuOpen}
    onToggleMenu={setIsMenuOpen}
  >
  <div className="relative w-full flex flex-col justify-center items-center gap-4 sm:gap-6 mt-2 mb-0">
  <NewEntryButton className="w-40" />
  {data.length > 0 && ( <VisualizeButton entries={data}  onClick={(entry) => navigate('/chart', { state: { entry } })} className="w-40" /> )}
  <EditDeleteButton className="w-40" />
  <LogoutButton onLogout={handleLogout} loading={logoutLoading} success={logoutSuccess} error={logoutError} className="w-40" />
  </div>
</CardNav>
</div>
      <motion.div
  className="w-full max-w-7xl flex flex-col text-emerald-500 dark:text-gray-100 px-6 py-4 justify-start items-center transition-colors duration-500 overflow-visible overflow-x-hidden min-h-screen"
  transition={{ duration: 0.35, ease: 'easeInOut' }}
>

    <div className=" py-6 text-center items-center justify-center space-y-4 min-h-[6rem]">
    <AnimatedHeadline />
    <FirstTimeWelcome />
    <FootprintPulseCard />
    {showLimitMsg && (
  <motion.div
    key="limit-msg"
    initial={{ scale: 0.8, opacity: 0, y: -20 }}
    animate={{ scale: [1.1, 0.95, 1.05, 1], y: [0, -5, 3, 0], opacity: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="w-fit mt-4 mb-0 md:ml-56 text-center items-center pr-4 pl-4 py-3 text-xs sm:text-base font-intertight tracking-normal text-shadow-md leading-relaxed text-yellow-900 bg-yellow-100 border border-yellow-300 rounded-xl shadow-amber-500"
  ><button
      onClick={() => setShowLimitMsg(false)}
      className=" text-base mr-1 sm:text-xl animate-bounce hover:scale-110 transition-transform duration-200"
      aria-label="Close alert"
    >
    ❌
    </button>
    You have reached the limit of 5 entries<span className="animate-pulse">! </span> Please delete older entries to add new ones
    <motion.span
        className="inline-block text-xl font-medium ml-1"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
      >
      .
      </motion.span>
      <motion.span
        className="inline-block text-xl font-medium"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
      >
      .
      </motion.span>
      <motion.span
        className="inline-block text-xl font-medium"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 1.2 }}
      >
      .
      </motion.span>
  </motion.div>
)}
<div className="flex justify-center mt-4 opacity-50">
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-[2px] w-80 bg-gradient-to-r 
                       from-transparent via-white/60 to-transparent"
          />
        </div>
    </div>
        <main className="flex flex-col space-y-4 sm:space-y-6 ">
          {loading ? (
            <motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: [0.3, 1, 0.3] }}
  transition={{ repeat: Infinity, duration: 1.5 }}
  className="text-lg text-white items-center text-center justify-center"
>
  Loading your carbon data...
</motion.p>

          ) : data.length > 0 ? (
            <AnimatePresence>
              <h2 className="flex flex-wrap sm:-ml-96 sm:mr-24 justify-center sm:gap-3 gap-1 text-lg sm:text-4xl font-germania tracking-wider text-shadow-DEFAULT text-white transition-colors duration-500">Emission
Insights
&
Suggestions</h2>
            <motion.div
            className="flex flex-col gap-4 sm:gap-6"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {},
              }}
              initial="hidden"
              animate="visible"
            >
            {data.map((entry, index) => (
              <motion.div
                key={entry._id || index}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17, duration: 0.25, ease: "easeOut" }}
                whileHover={{ scale: 1.03, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" }}
                style={{ willChange: "transform, opacity", transform: "translateZ(0)", fontFamily: 'InterTight', fontWeight: 700 }}
                whileTap={{ scale: 0.97, transition: { duration: 0.05 } }}
                className={` relative group bg-gray-800/70 rounded-3xl backdrop-blur-md p-4 shadow-md text-xs sm:text-sm origin-center transition-colors duration-300 cursor-pointer md:ml-28 md:w-4/5`}
       onClick={() => {
  setOpenSection(prev => prev === `suggestion-${index}` ? null : `suggestion-${index}`);
}}
 >
  {/* animatedborder */}
  <div className="absolute inset-0 rounded-3xl border-2 border-transparent 
                opacity-0 group-hover:opacity-100 animate-borderFlow 
                border-emerald-500 dark:border-gray-100 pointer-events-none" />

                <div className="text-lg sm:text-2xl md:text-3xl font-normal tracking-normal sm:font-semibold sm:tracking-wider font-intertight text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500">
  <div className="relative inline-block">
    <div className="hidden sm:block">
  <span className="absolute left-[7px] -top-[6px] animate-smoke text-sm opacity-50 delay-0">☁️</span>
  <span className="absolute left-[10px] -top-[8px] animate-smoke text-xs opacity-40 delay-400">☁️</span>
  <span className="absolute left-[5px] -top-[10px] animate-smoke text-[10px] opacity-30 delay-800">☁️</span>
  </div><span className="inline-block">🏭</span>
</div>
 Total Emission <span className="animate-colon-glow text-white">:</span> <span>
  {Math.floor(entry.totalEmissionKg)}
  <span className="hidden sm:inline">
    .{String(entry.totalEmissionKg.toFixed(2)).split('.')[1]}
</span><span className="hidden sm:inline">{" "}  </span>
</span>
 Kg CO<span className="hidden sm:inline-block text-white"><span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span></span>
<span className="inline text-white sm:hidden ml-[1px] text-[1em] align-sub">
  2
</span>
</div>
    <section
  key={`suggestion-${index}`}
  ref={(el) => (historySectionRefs.current[index] = el)}
  className="px-1 pb-1 transition-all duration-500"
>
  <h2 className="text-base sm:text-xl md:text-2xl font-normal sm:font-semibold tracking-normal sm:tracking-wider font-intertight text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500">
  {openSection === `suggestion-${index}` ? (<><span className="animate-idea-glow">💡</span> Suggestions <span className="animate-colon-glow text-white">:</span>
</>) : (
    <>
      <span className="animate-lightbulb-pulse">💡</span> Suggestions
      <span className="inline-block text-white text-lg font-normal sm:text-2xl sm:font-bold ml-1 animate-dot-glow-1">
        .
      </span>
      <span className="inline-block text-white text-lg font-normal sm:text-2xl sm:font-bold animate-dot-glow-2">
        .
      </span>
      <span className="inline-block text-white text-lg font-normal sm:text-2xl sm:font-bold animate-dot-glow-3">
        .
      </span>
    </>
  )}
  </h2>
  <motion.div
  layout
    className={`transition-all font-extralight duration-500 ease-in-out ${
      openSection === `suggestion-${index}`
        ? 'max-h-[1500px] opacity-100 mt-2  overflow-visible'
        : 'max-h-0 opacity-0  overflow-hidden'
    }`}
  >
    <div className="text-sm text-emerald-500 dark:text-gray-100 transition-colors duration-300 suggestions-content">
  <p
    dangerouslySetInnerHTML={{
      __html: entry.suggestions.replace(/\n/g, "<br>")
    }}
  ></p>

    <p className="text-xs italic text-white mt-1">
  🕒{" "}
  {entry.updatedAt && entry.updatedAt !== entry.createdAt
    ? "Updated on "
    : "Created on "}
  {new Date(
    entry.updatedAt && entry.updatedAt !== entry.createdAt
      ? entry.updatedAt
      : entry.createdAt
  )
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
    .replace(",", " ,")}
</p>

  </div>
  </motion.div>
</section>

              </motion.div>
            ))}
              </motion.div>
</AnimatePresence>
          ) : (
            <div className="text-base mt-[-1rem] font-intertight tracking-wide text-shadow-DEFAULT font-normal text-emerald-600 dark:text-white text-center">
              <p
  onClick={() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }}
>
  Your dashboard starts with one entry.
Open the top-left menu and add your first data point and visualize it
  <motion.span
  className="inline-block text-base sm:text-3xl font-medium"
  animate={{ opacity: [0, 1, 0] }}
  transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0 }}
>
  .
</motion.span>
<motion.span
  className="inline-block text-base sm:text-3xl font-medium"
  animate={{ opacity: [0, 1, 0] }}
  transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0.4 }}
>
  .
</motion.span>
<motion.span
  className="inline-block text-base sm:text-3xl font-medium"
  animate={{ opacity: [0, 1, 0] }}
  transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0.8 }}
>
  .
</motion.span></p>
</div>
          )}
<div className="flex justify-center mt-4 opacity-50">
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-[2px] w-80 bg-gradient-to-r 
                       from-transparent via-white/60 to-transparent"
          />
        </div>
          {/* Expandable Sections */}
          <div className="mb-2 sm:mb-6 pb-2 sm:pb-4 flex flex-col gap-4 sm:gap-6 pr-2 will-change-transform">
            <h2 className="flex flex-wrap sm:-ml-44 justify-center sm:gap-3 gap-1 text-lg sm:text-4xl font-germania tracking-wider text-shadow-DEFAULT text-white transition-colors duration-500">Understanding
Our
Planet
—
and
Our
Place
Within
It</h2>
{[
  {
    id: 'understanding',
    title: '🌍 Understanding the Air We Share',
    content: (
      <>
        <p className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 transition-colors duration-500">
          🌫️ <strong>Carbon Dioxide (CO₂)</strong> is like Earth's invisible blanket. It keeps us warm — but too much of it, from burning fuels 🚗🔥, causes overheating and extreme weather patterns! 😓
        </p>
        <ul className="list-disc list-inside text-sm text-emerald-500 dark:text-gray-100 mt-2 transition-colors duration-500">
          <li>🌀 <strong>Methane (CH₄):</strong> Produced by livestock, rice farming, and landfill.</li>
          <li>🌾 <strong>Nitrous Oxide (N₂O):</strong> Released from fertilizers and agricultural activities.</li>
          <li>❄️ <strong>Fluorinated Gases:</strong> Man-made gases from industrial processes and cooling system.</li>
        </ul>
        <p className="text-sm text-emerald-500 dark:text-gray-100 mt-2 transition-colors duration-500">
          These gases trap heat and make Earth too hot to handle. 🔥
        </p>
      </>
    ),
  },
  {
    id: 'global',
    title: '📊 How Much CO₂ Do We Emit Individually?',
    content: (
      <p className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 transition-colors duration-500">
        🧮 In 2024, the average carbon footprint was about <strong>4.7 tons per year</strong> (~392 kg per month). 
        But this varies widely by region:
        <br />🌎 <strong>USA:</strong> ~1,240 kg/month 😬 (energy-heavy lifestyle)
        <br />🇮🇳 <strong>India:</strong> ~192 kg/month (rising with rapid urbanization)
        <br />🌍 <strong>Sub-Saharan Africa:</strong> ~75 kg/month (lowest yet most affected by climate change)
        <br />
        <br />
        Each ton matters. Cutting down even by <strong>10%</strong> — through energy conservation, green transport, and mindful habits — 
        helps slow climate change for future generations. 🌱
      </p>
    ),
  },
  {
    id: 'impact',
    title: '🔥 Carbon and Greenhouse Gases',
    content: (
      <p className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 transition-colors duration-500">
        <strong>CO₂</strong> is the largest contributor to global warming, trapping heat like a thermal blanket. 
        Other gases such as <strong>CH₄</strong>, <strong>N₂O</strong>, and <strong>F-gases</strong> multiply the effect. Together, they're driving 
        extreme weather — hotter summers, stronger storms, and rising sea levels. 🌪️🔥🌊  
        <br />
        <br />
        Every action to reduce emissions — from using <strong>renewable energy</strong> to <strong>planting trees</strong> — 
        slows the rise of Earth's temperature and protects ecosystems worldwide. 🌳
      </p>
    ),
  },
  {
    id: 'solutions',
    title: '🔍 Why Calculate Your Carbon Footprint?',
    content: (
      <p className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 transition-colors duration-500">
        📏 Knowing your footprint shows how your choices affect the planet. You'll identify 
        areas to cut emissions — whether it's switching to <strong>renewable energy</strong>, reducing <strong>car travel</strong>, 
        or improving <strong>home efficiency</strong>.  
        <br />
        <br />
        Tracking your impact helps you build <strong>sustainable habits</strong>, save money, and join a 
        growing community of people making positive environmental changes. 🌿
      </p>
    ),
  },
  {
    id: 'calculator',
    title: '📱 How Our Carbon Calculator Works',
    content: (
      <p className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 transition-colors duration-500">
        Our tool estimates your emissions based on <strong>energy use</strong> ⚡, <strong>travel habits</strong> 🚙✈️, 
        <strong>diet</strong> 🥗, and <strong>waste management</strong> ♻️.  
        <br />
        <br />
        After entering your details, you'll get a breakdown of your <strong>monthly CO₂ footprint</strong> 
        and practical suggestions for reducing it. Think of it as your personal guide to 
        sustainable living — <strong>simple, clear, and actionable!</strong> ✨
      </p>
    ),
  },
  {
    id: 'action',
    title: '🌱 Your Action Plan Starts Here!',
    content: (
      <ul className="list-disc list-inside text-xs sm:text-sm text-emerald-500 dark:text-gray-100 transition-colors duration-500">
        <li>💡 <strong>Energy:</strong> Switch to LEDs, unplug idle electronics, and explore solar options.</li>
        <li>🚶‍♂️ <strong>Transport:</strong> Walk, cycle, or use public transit to cut fuel emissions.</li>
        <li>♻️ <strong>Waste:</strong> Reuse, recycle, and compost to reduce landfill methane.</li>
        <li>🥦 <strong>Diet:</strong> Incorporate more plant-based meals and reduce food waste.</li>
        <li>📣 <strong>Voice:</strong> Support eco-friendly policies and encourage others to act sustainably.</li>
        <li>🌍 <strong>Mindset:</strong> Small changes, multiplied by millions, can reshape our planet's future.</li>
      </ul>
    ),
  },
]
.map((section, index) => {
    const extractEmojiAndText = (title) => {
      const match = title.match(/^([\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u2600-\u26FF\u2700-\u27BF]+)\s+(.*)$/u);
      if (match) return { emoji: match[1], text: match[2] };
      return { emoji: '', text: title };
    };

    const emojiVariants = {
  idle: {
    rotate: [0, 4, -4, 0],
    scale: [1, 1.1, 0.9, 1],
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
  },
  hover: {
    scale: [1, 1.3, 1],
    rotate: [0, 12, -12, 0],
    transition: { duration: 0.3 },
  },
};
    const { emoji, text } = extractEmojiAndText(section.title);

    return (
      <motion.section
        layout
        key={section.id}
        ref={(el) => (infoSectionRefs.current[index] = el)}
        initial={{ opacity: 0, y: -30, scale: 0.95  }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 400, damping: 17, duration: 0.25, ease: "easeOut" }}
        whileHover={{ scale: 1.03, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" }}
        style={{ willChange: "transform, opacity", transform: "translateZ(0)", fontFamily: 'InterTight', fontWeight: 700 }}
        whileTap={{ scale: 0.97, transition: { duration: 0.05 } }}
        className={`p-4 relative group bg-gray-800/70 rounded-3xl backdrop-blur-md shadow-lg cursor-pointer origin-center transition-colors duration-300 md:ml-28 md:w-4/5`}
        onClick={() =>{ setOpenSection(prev => prev === section.id ? null : section.id); setTimeout(() => {
    const emojiEl = document.getElementById(`emoji-${section.id}`);
    if (emojiEl) triggerConfetti(emojiEl);
  }, 200);
}}
        //style={{ fontFamily: 'InterTight', fontWeight: 700 }}
      >
         {/* animatedborder */}
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent 
                opacity-0 group-hover:opacity-100 animate-borderFlow 
                border-emerald-500 dark:border-gray-100 pointer-events-none" />

        <motion.h2
          className="text-lg sm:text-2xl md:text-3xl font-normal sm:font-semibold tracking-normal sm:tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-white mb-2 transition-colors duration-500 flex items-center gap-2"
        >
          {/* 🔥 Animated Emoji with burst-on-tap */}
          <motion.span
  id={`emoji-${section.id}`}
  className="relative inline-block"
  variants={emojiVariants}

  // ❌ disable animation on mobile
  animate={isMobile ? undefined : "idle"}
  whileHover={isMobile ? undefined : "hover"}

  role="img"
  aria-label="Section emoji"
>
  {emoji}
</motion.span>

          {text}
        </motion.h2>

        <div
  className={`transition-all font-extralight duration-500 ease-in-out overflow-hidden suggestions-content ${
    openSection === section.id ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
  }`}
>
  {section.content}
</div>
      </motion.section>
    );
  })
}
</div>
        </main>
<div ref={bottomRef}></div>
{/* Feedback Button */}
<div className="w-full flex justify-center items-center mt-3 -mb-4 sm:-mb-0">
  <div className="flex flex-col items-center gap-3">
    <p className="text-sm sm:text-base hidden sm:block text-white/70 text-center text-shadow-DEFAULT tracking-wide font-intertight">
      Have suggestions? Found a bug? We'd love to hear from you!
    </p>
    <FeedbackButton 
      userEmail={user?.email}
    />
  </div>
</div>
</motion.div>    
    </PageWrapper>
    </motion.div>
  );
};

export default Dashboard;
