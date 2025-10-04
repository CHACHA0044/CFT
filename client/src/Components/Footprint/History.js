import API from 'api/api';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageWrapper from 'common/PageWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { EditButton, DeleteButton, ClearAllButton, LogoutButton } from 'Components/globalbuttons';
import { NewEntryButton, VisualizeButton, DashboardButton } from 'Components/globalbuttons';
import CardNav from 'Components/CardNav';  
import LottieLogo from 'Components/LottieLogoComponent';
import useAuthRedirect from 'hooks/useAuthRedirect';
  const sentence = "Emission History";
  const words = sentence.split(" ");
  //const bottomRef = useRef(null);
  
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
  
  // const triggerConfetti = (element) => {
  //   if (!element) return;
  
  //   for (let i = 0; i < 8; i++) {
  //     const conf = document.createElement('span');
  //     const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F43F5E', '#22D3EE'];
  //     const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  //     conf.className = 'absolute w-1.5 h-1.5 rounded-full pointer-events-none';
  //     conf.style.backgroundColor = randomColor;
  //     conf.style.left = '50%';
  //     conf.style.top = '50%';
  //     conf.style.position = 'absolute';
  
  //     const x = `${Math.random() * 60 - 30}px`;
  //     const y = `${Math.random() * 60 - 30}px`;
  //     conf.style.setProperty('--x', x);
  //     conf.style.setProperty('--y', y);
  //     conf.style.animation = `confetti-burst 600ms ease-out forwards`;
  
  //     element.appendChild(conf);
  //     setTimeout(() => conf.remove(), 700);
  //   }
  // };
  
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
      <div className="relative overflow-visible w-full flex justify-center items-center mt-4 px-4">
        <motion.div
          className="flex flex-wrap justify-center gap-3 text-4xl sm:text-6xl md:text-8xl font-black font-germania sm:tracking-widest tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
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
const History = () => {
  useAuthRedirect();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [success, setSuccess] = useState('');
  const [loadingId, setLoadingId] = useState(null); 
  const [clearingAll, setClearingAll] = useState(false); // for clear all
  const [deletedId, setDeletedId] = useState(null);
  const [cleared, setCleared] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [logoutSuccess, setLogoutSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [location.state?.updated]);

useEffect(() => {
  if (error || success) {
    const timer = setTimeout(() => {
      setError('');
      setSuccess('');
    }, 2500);
    return () => clearTimeout(timer);
  }
}, [error, success]);

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
 const fetchHistory = async () => {
  setLoading(true);
  try {
    const response = await API.get('/footprint/history');
    const sorted = (Array.isArray(response.data) ? response.data : [])
  .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
setHistory(sorted);
  } catch (err) {
    console.error(err);
    setError('An error occurred while fetching history');
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
  setLoadingId(id);
    const deletedEntry = history.find((e) => e._id === id);
    const emission = deletedEntry?.totalEmissionKg || "N/A";
    await new Promise((resolve) => setTimeout(resolve, 600));
  try {
    await API.delete(`/footprint/${id}`);
    setSuccess(`Entry (${emission} kg CO₂) deleted successfully 🌱 `);
    setDeletedId(id); // NEW: Track deleted item
    await fetchHistory();
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    setTimeout(() => {
      setDeletedId(null); // Reset after delay
    }, 2000);
  } catch (err) {
    console.error(err);
    setError('Failed to delete entry ❌');
  } finally {
    setLoadingId(null);
  }
};

 const handleClearAll = async () => {
  setClearingAll(true);
  try {
    await API.delete('/footprint/clear/all');
    setCleared(true); 
    await fetchHistory(); 
    setSuccess('All entries successfully deleted 🧹');
    setTimeout(() => {
      setCleared(false); 
    }, 1500);
  } catch (err) {
    console.error(err);
    setError('Failed to clear history ❌');
  } finally {
    setClearingAll(false); 
  }
};

return (
  <motion.div
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    className="w-full  h-full"
  >
    <PageWrapper backgroundImage="/images/history-bk.webp">
  <div className="w-full max-w-7xl flex flex-col px-6 py-6 overflow-y-auto overflow-x-hidden overflow-visible text-emerald-500 dark:text-white transition-colors duration-500">
    <div className=" w-auto px-0">
<CardNav
  logo={<LottieLogo isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />}
  logoAlt="Animated Menu"
  baseColor="#fff"
  menuColor="bg-white/20 dark:bg-gray-800/70"
  buttonBgColor="#111"
  buttonTextColor="#fff"
  logoSize="w-25 h-25"
  ease="power3.out"
  isMenuOpen={isMenuOpen}
  onToggleMenu={setIsMenuOpen}
>
  <div className="relative w-full flex flex-col justify-center items-center gap-4 sm:gap-6 mt-2 mb-0">
    <NewEntryButton className="w-40" />
    <DashboardButton className="w-40" />
    {history.length > 0 && (<VisualizeButton entries={history} onClick={(entry) => navigate('/chart', { state: { entry } })} className="w-40" /> )}
    <LogoutButton onLogout={handleLogout} loading={logoutLoading} success={logoutSuccess} error={logoutError} className="w-40" />
  </div>
</CardNav>
</div>
<motion.div
           
           animate={{ 
             filter: isMenuOpen ? 'blur(5px)' : '',
             pointerEvents: isMenuOpen ? 'none' : 'auto'
           }}
           transition={{ duration: 0.35, ease: 'easeInOut' }}
         >
          <h2 className="text-3xl font-bold mb-6 text-center"><AnimatedHeadline /></h2>

          <AnimatePresence>
            {success && (
              <motion.p
                key="success"
                className="text-green-500 font-intertight text-shadow-DEFAULT text-sm text-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {success}
              </motion.p>
            )}
            {error && (
              <motion.p
                key="error"
                className="text-red-600 font-intertight text-shadow-DEFAULT text-sm text-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
<AnimatePresence mode="wait">
  {loading ? (
    <motion.p
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center sm:text-xl -mt-4 ml-5 font-intertight text-shadow-DEFAULT"
    >
      Getting entries<AniDot />
    </motion.p>
  ) : history.length === 0 ? (
    <motion.p
      key="no-entries"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center sm:text-xl -mt-4 ml-5 font-intertight text-shadow-DEFAULT"
    >
      No entries found<AniDot />
    </motion.p>
  ) : (
    <motion.div
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
        hidden: {},
      }}
      initial="hidden"
      animate="visible"
    >
      {history.map((entry, index) => (
        <motion.div
          key={entry._id}
          layout
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
          }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0px 8px 20px rgba(0,0,0,0.2)',
          }}
          whileTap={{
            scale: 0.97,
            transition: { duration: 0.05 },
          }}
          className="relative group bg-white/20 dark:bg-gray-800/70 backdrop-blur-md shadow-md rounded-3xl font-intertight font-normal sm:font-semibold sm:tracking-wider text-shadow-DEFAULT p-4 mb-4 md:ml-64 md:w-7/12 origin-center transition-colors duration-300"
        >
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent 
                      opacity-0 group-hover:opacity-100 animate-borderFlow 
                      border-emerald-500 dark:border-gray-100 pointer-events-none" />
          <div className="text-lg sm:text-2xl md:text-3xl text-emerald-500 dark:text-white transition-colors duration-500">
            <div className="relative inline-block">
              <span className="absolute left-[4px] -top-[6px] animate-smoke text-sm opacity-50 delay-0">☁️</span>
              <span className="absolute left-[8px] -top-[8px] animate-smoke text-xs opacity-40 delay-400">☁️</span>
              <span className="absolute left-[2px] -top-[10px] animate-smoke text-[10px] opacity-30 delay-800">☁️</span>
              <span className="inline-block">🏭</span>
            </div>{' '}
            Total Emission{' '}
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              :
            </motion.span>{' '}
            <span>
              {Math.floor(entry.totalEmissionKg)}
              <span className="hidden sm:inline">
                .{String(entry.totalEmissionKg.toFixed(2)).split('.')[1]}
              </span>
              <span className="hidden sm:inline"> </span>
            </span>{' '}
            kg CO
            <span
              className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
              style={{ '--random': Math.random() }}
            >
              2
            </span>
          </div>

          <p className="text-xs italic text-emerald-500 dark:text-white mt-1">
            {entry.updatedAt && entry.updatedAt !== entry.createdAt
              ? `Updated on ${new Date(entry.updatedAt).toLocaleString()}`
              : `Created on ${new Date(entry.createdAt).toLocaleString()}`}
          </p>

          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <EditButton
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit/${entry._id}`);
              }}
            />
            <DeleteButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(entry._id);
              }}
              disabled={loadingId === entry._id}
              text={
                loadingId === entry._id
                  ? 'Processing...'
                  : deletedId === entry._id
                  ? 'Deleted'
                  : 'Delete'
              }
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>


          {history.length > 0 && (
            <ClearAllButton
              onClick={handleClearAll}
              disabled={clearingAll}
              text={
                clearingAll ? 'Processing...' : cleared ? 'Cleared' : 'Clear All'
              }
              styleOverride={{ width: '12rem', margin: '1rem auto' }}
            />
          )}
          </motion.div>
        </div>  
    </PageWrapper>
  </motion.div>
);

};

export default History;
