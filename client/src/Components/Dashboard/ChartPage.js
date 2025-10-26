import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { AnimatePresence, motion } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import useAuthRedirect from 'hooks/useAuthRedirect';
import { VictoryVoronoiContainer,VictoryTheme, VictoryZoomContainer, VictoryLabel, VictoryLine, VictoryScatter, VictoryChart, VictoryGroup, VictoryBar, VictoryAxis, VictoryTooltip, VictoryPie, VictoryArea } from 'victory';
import API from 'api/api';
import calculateEmissions from 'utils/calculateEmissionsFrontend';
import Lottie from 'lottie-react';
import IceAnimation from 'animations/Ice.json';
import FireAnimation from 'animations/Fire.json';
import DragonAnimation from 'animations/Dragon.json';
import SunAnimation from 'animations/Sun.json';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Dot } from 'recharts';
import { select, zoom, scaleLinear } from 'd3';
import { easeInOut } from "framer-motion"; 
import { easeCubicOut } from "d3-ease";
import CardNav from 'Components/CardNav';  
import LottieLogo from 'Components/LottieLogoComponent';
import { NewEntryButton, EditDeleteButton, DashboardButton, WeatherButton, LogoutButton, VisualizeButton } from 'Components/globalbuttons';

const globalAverages = {
  food: 140,
  transport: 130,
  electricity: 120,
  waste: 60,
};
const sentence = "Your Emission Trends";const words = sentence.split(" ");

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
      <div className="relative overflow-visible w-full flex justify-center items-center mt-2 sm:mb-4 mb-2 px-4">
        <motion.div
          className="flex sm:flex-nowrap flex-wrap justify-center gap-3 text-4xl sm:text-6xl md:text-8xl font-black font-germania tracking-widest text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
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
              className="relative inline-block cursor-pointer whitespace-nowrap"
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
                      className="inline-block relative whitespace-nowrap"
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

  const ResponsiveTooltip = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 760); 
    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Tooltip
      {...props}
      position={isMobile ? { y: 0, x: 5 } : undefined} 
      wrapperStyle={{
        maxWidth: isMobile ? "90vw" : "auto",
        whiteSpace: "normal",
      }}
    />
  );
};

const WeatherCountdown = React.memo(({ weatherTimestamp, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!weatherTimestamp) return;

    const updateTimer = () => {
      const thirtyMinutes = 30 * 60 * 1000;
      const elapsed = Date.now() - weatherTimestamp;
      const remaining = Math.max(0, thirtyMinutes - elapsed);
      
      setTimeLeft(Math.floor(remaining / 1000));
      
      if (remaining <= 0) {
        onExpire();
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [weatherTimestamp, onExpire]);

  if (timeLeft <= 0) return "Weather data expired";

  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  return (
    <>
      {`Weather data expires in ${minutesLeft}m ${secondsLeft}s `}
      <motion.span
        animate={{ rotateX: [0, 180, 360] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="inline-block"
      >
        ⌛
      </motion.span>
    </>
  );
});
const RefreshCountdown = React.memo(({ weatherTimestamp, onRefreshAvailable }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!weatherTimestamp) return;

    const updateTimer = () => {
      const tenMinutes = 10 * 60 * 1000;
      const elapsed = Date.now() - weatherTimestamp;
      const remaining = Math.max(0, tenMinutes - elapsed);
      
      setTimeLeft(Math.floor(remaining / 1000));
      
      if (remaining <= 0) {
        onRefreshAvailable();
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [weatherTimestamp, onRefreshAvailable]);

  if (timeLeft <= 0) return null;

  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  return (
    <div className="text-center text-xs text-gray-400 mb-2">
      {`Refresh available in ${minutesLeft}m ${secondsLeft}s `}
      <motion.span
        animate={{ rotateY: [0, 180, 360] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="inline-block"
      >
        🔄
      </motion.span>
    </div>
  );
});
const ChartPage = () => {
  useAuthRedirect();
  const location = useLocation();
  const [entryData, setEntryData] = useState(location.state?.entry || null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [user, setUser] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const processed = useMemo(() => entryData ? calculateEmissions(entryData) : null, [entryData]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [error, setError] = useState(null);
  const [zoomRange, setZoomRange] = useState([1, 12]);
  const handleZoom = useCallback((e) => { if (!e.ctrlKey) return; e.preventDefault();
  const rect = chartRef.current.getBoundingClientRect();
  const scale = scaleLinear().domain([rect.left, rect.right]).range([zoomRange[0], zoomRange[1]]);
  const pointerX = e.clientX;
  const pointerMonth = scale(pointerX);
  const range = zoomRange[1] - zoomRange[0];
  const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
  const newRange = range * zoomFactor;
  const newMin = Math.max(1, pointerMonth - (pointerMonth - zoomRange[0]) * zoomFactor);
  const newMax = Math.min(12, newMin + newRange); setZoomRange([newMin, newMax]);}, [zoomRange]);
  const [data, setData] = useState(null);
  const [expandedWeatherSection, setExpandedWeatherSection] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [weatherRequested, setWeatherRequested] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherTimestamp, setWeatherTimestamp] = useState(null);
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [allEntries, setAllEntries] = useState([]);
  const [showECM, setShowECM] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState('');
  const navigate = useNavigate();

const fetchWeatherAndAqi = useCallback(async (forceRefresh = false) => {
  setLoadingWeather(true);
  let lat, lon;

  // Location logic
  if (navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Geolocation timeout")), 10000);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timer);
            resolve(position);
          },
          (err) => {
            clearTimeout(timer);
            reject(err);
          }
        );
      });

      //Rounding coordinates to match backend and prevent cache key fragmentation
      lat = parseFloat(pos.coords.latitude.toFixed(4));
      lon = parseFloat(pos.coords.longitude.toFixed(4));
      console.log("📍 Browser location:", { lat, lon });
    } catch (err) {
      console.warn("⚠️ Geolocation denied or unavailable. Falling back to IP-based location...");
    }
  }

  try {
    // Build query params properly
    const params = new URLSearchParams();
    if (lat && lon) {
      params.append("lat", lat);
      params.append("lon", lon);
    }
    if (forceRefresh) {
      params.append("refresh", "true");
    }
    // Default to tomorrow.io - change this to test different APIs
   // params.append("forceApi", "tomorrow");
    
    const queryString = params.toString();
    console.log("🌐 Fetching weather with params:", queryString);

    const res = await API.get(`/auth/weather-aqi?${queryString}`);

    console.log("✅ Weather response received:", res.data);
    
    setData(res.data);
    setWeatherRequested(true);
    setWeatherTimestamp(Date.now());
    
    // Handle refresh cooldown
    if (forceRefresh) {
      setShowRefreshButton(false);
    }
    
    // refresh option
    if (res.data.refreshAllowedIn !== undefined) {
      setRefreshCooldown(res.data.refreshAllowedIn);
    } else {
      setRefreshCooldown(0);
    }
  } catch (err) {
    console.error("❌ Failed to fetch weather/AQI data:", err);
    console.error("❌ Error response:", err.response?.data);
  } finally {
    setLoadingWeather(false);
  }
}, []);
const isWeatherDataExpired = () => {
  if (!weatherTimestamp) return true;
  const thirtyMinutes = 30 * 60 * 1000;
  return (currentTime - weatherTimestamp) > thirtyMinutes;
};
const handleGetWeatherInfo = async () => {
  await fetchWeatherAndAqi();
};
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
const handleRefreshAvailable = useCallback(() => {
  setShowRefreshButton(true);
}, []);
// countdown effect
const [currentTime, setCurrentTime] = useState(Date.now());
//getting user name , route does other things also
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/token-info/me'); 
      setUser(res.data);
      sessionStorage.setItem('userName', res.data.name);
    } catch (err) {
      console.error('Failed to load user info:', err);
    }
  };
  fetchUser();
}, []); // using empty array to make it run only once
  const total = processed?.totalEmissionKg;
  const values = {
  food: processed?.foodEmissionKg,
  transport: processed?.transportEmissionKg,
  electricity: processed?.electricityEmissionKg,
  waste: processed?.wasteEmissionKg,
};
useEffect(() => {
  if (!total) return;
  const data = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    value: total + ((i) / 11) * (total * 12 - total)
  }));
  setProjectionData(data);
}, [total]);
useEffect(() => {
  const fetchAllEntries = async () => {
    try {
      const res = await API.get('/footprint/history');
      const result = res.data;
      const entries = Array.isArray(result) ? result : result.history || [];
      const sortedEntries = entries.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      setAllEntries(sortedEntries);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    }
  };

  fetchAllEntries();
}, []);
const [projectionData, setProjectionData] = useState([]);
const [dotMonth, setDotMonth] = useState(1);
const [ setDotData] = useState(null);
const svgRef = useRef(null);
const [dragging, setDragging] = useState(false);
const [hoverMonth, setHoverMonth] = useState(null);
const [dotY, setDotY] = useState(null);
const dotData = projectionData.find(d => d.month === dotMonth);
const chartRef = useRef(null);
const comparison = Object.keys(values).map(cat => ({
    category: cat.charAt(0).toUpperCase() + cat.slice(1),
    user: values[cat],
    global: globalAverages[cat]
  }));
const pieData = Object.entries(values).map(([k, v]) => ({
  x: k.charAt(0).toUpperCase() + k.slice(1),
  y: v,
  label: v != null ? `${k}: ${v.toFixed(1)} kg` : `${k}: No data`
}));
  const yearly = total * 12;
  const yearlyChartData = useMemo(() => {
  if (!total) return [];
  
  const currentMonth = new Date().getMonth(); // 0-11
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
  
  return Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (currentMonth + i) % 12;
    const cumulativeValue = total * (i + 1);
    
    return {
      month: i + 1,
      monthName: monthNames[monthIndex],
      fullMonthName: fullMonthNames[monthIndex],
      value: cumulativeValue / 1000,
      cumulativeKg: cumulativeValue
    };
  });
}, [total]);
  const topCat = Object.keys(values).reduce((a, b) => values[a] > values[b] ? a : b);
  const tips = {
    food: 'Try more plant‑based meals to cut food emissions.',
    transport: 'Choose public transport, cycling, or walking.',
    electricity: 'Switch to renewable energy and conserve power.',
    waste: 'Reduce and compost waste to minimize emissions.',
  };
const abortControllerRef = useRef(new AbortController());
useEffect(() => {
  if (!entryData || !entryData._id) return;

  const controller = new AbortController();
  let isMounted = true;

  const fetchAllData = async () => {
    try {
      setError(null);

      const entryId =
        typeof entryData._id === 'string'
          ? entryData._id
          : entryData._id?.$oid || entryData._id?.toString();

      if (!entryId) {
        throw new Error('Invalid or missing entry ID.');
      }
      //console.log("📦 Attempting to fetch entry with ID:", entryId);

      const [entryRes, historyRes] = await Promise.all([
        API.get(`/footprint/${entryId}`, {
          withCredentials: true,
          signal: controller.signal
        }).catch(err => {
          if (err.name === 'CanceledError' || err.name === 'AbortError') return;
          //console.error('❌ Entry fetch error:', err.response?.data || err.message);
          throw new Error(err.response?.data?.error || 'Failed to load footprint data');
        }),

        API.get('/footprint/history', {
          withCredentials: true,
          signal: controller.signal
        }).catch(err => {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
       // console.error('❌ History fetch error:', err.response?.data || err.message);
        throw new Error(err.response?.data?.error || 'Failed to load history data');
      })
      ]);

      if (!isMounted || !entryRes?.data || !historyRes?.data) return;

      setEntryData(entryRes.data);

      const sorted = [...historyRes.data].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );

      const index = sorted.findIndex(e => e._id === entryRes.data._id);
     // console.log("📊 Found index in sorted history:", index);

      if (index !== -1) {
        const lbRes = await API.get(`/footprint/leaderboard-nth?n=${index}`, {
          withCredentials: true,
          signal: controller.signal
        }).catch(err => {
          if (err.name !== 'AbortError') {
          //  console.error('❌ Leaderboard fetch error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.error || 'Failed to load leaderboard');
          }
        });

        if (lbRes && isMounted) {
          setLeaderboard(lbRes.data || []);
        }
      }
    } catch (err) {
      if (isMounted && err.name !== 'AbortError') {
        //console.error('❌ Fetch error:', err);
        setError(err.message || 'Failed to load data. Please try again.');
      }
    }
  };

  fetchAllData();

  return () => {
    isMounted = false;
    controller.abort();
  };
}, [entryData?._id]);
useEffect(() => {
  const handleClickOutside = () => {
    setSelectedIndex(null);
  };

  window.addEventListener('click', handleClickOutside);
  return () => window.removeEventListener('click', handleClickOutside);
}, []);
const handleLegendClick = (index) => {
  requestAnimationFrame(() => {
    setSelectedIndex(prev => (prev === index ? null : index));
  });
};
const handleMouseMove = useCallback((e) => {
    if (!chartRef.current || !total) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 12, 1), 12);
    const y = total + ((x - 1) / 11) * (total * 12 - total);
    
  }, [total]);
  useEffect(() => {
    if (!total) return;
    let raf;
    let start = null;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 1000, 1);
   
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [total]);
useEffect(() => {
  const ref = chartRef.current;
  if (!ref) return;
  ref.addEventListener("wheel", handleZoom, { passive: false });
  return () => ref.removeEventListener("wheel", handleZoom);
}, [handleZoom]);
useEffect(() => {
  if (!chartRef.current || !projectionData.length) return;

  const svg = select(svgRef.current);
  const container = select(chartRef.current);
  const zoomBehavior = zoom()
    .scaleExtent([1, 3])
    .translateExtent([[0, 0], [chartRef.current.offsetWidth, chartRef.current.offsetHeight]])
    .on('zoom', (e) => {
      const scale = e.transform.rescaleX(scaleLinear().domain([1, 12]).range([1, 12]));
      const newMin = Math.max(1, scale(1));
      const newMax = Math.min(12, scale(12));
      setZoomRange([newMin, newMax]);
    });

  svg.call(zoomBehavior);
  return () => svg.on('.zoom', null);
}, [projectionData]);
const handlePointerMove = (e) => {
  if (!chartRef.current || !projectionData.length) return;
  const rect = chartRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const scale = scaleLinear().domain([0, rect.width]).range([1, 12]);
  const month = Math.round(scale(x));
  if (month >= 1 && month <= 12) {
    setHoverMonth(month);
  } else {
    setHoverMonth(null);
  }
};
const handlePointerDown = (e) => {
  if (!hoverMonth) return;
  setDotMonth(hoverMonth);
  const y = projectionData.find(d => d.month === hoverMonth)?.value;
  setDotY(y);
};
let topIndexes = new Set();
let bottomIndexes = new Set();
let dragonIndex = leaderboard.length > 0 ? leaderboard.length - 1 : null;
if (leaderboard.length <= 3) {
  topIndexes.add(0); // lowest emission
  if (leaderboard.length > 1) {
    bottomIndexes.add(leaderboard.length - 1); // highest emission
  }
} else {
  const topCount = Math.min(3, leaderboard.length);
  const bottomCount = Math.min(3, leaderboard.length - topCount);

  for (let i = 0; i < topCount; i++) topIndexes.add(i);
  for (let i = leaderboard.length - bottomCount; i < leaderboard.length; i++) bottomIndexes.add(i);
}
  const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};
const [activePoint, setActivePoint] = useState(null);
const yearlyData = [
  { x: "2025", y: 1200 },
  { x: "2026", y: 1100 },
  { x: "2027", y: 950 },
  { x: "2028", y: 800 },
];
useEffect(() => {
  if (activePoint) {
    const timer = setTimeout(() => setActivePoint(null), 3000);
    return () => clearTimeout(timer);
  }
}, [activePoint]);

return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} style={{ touchAction: 'pan-y' }} className=" min-h-screen text-white">
    <PageWrapper backgroundImage="/images/chart-bk.webp" className="flex-1 flex flex-col">
    {error && (
        <div className="bg-red-500/80 text-white p-4 text-center">
          {error}
        </div>
      )}
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
    <AnimatePresence>
      {showECM && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute -top-16 bg-emerald-500/90 dark:bg-black text-white px-2 py-2 rounded-xl shadow-lg text-shadow-DEFAULT text-sm font-intertight text-center z-50"
        >
          <div className="flex items-center gap-2">
            <span>Entry changed! Close menu to view it</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    <NewEntryButton className="w-40" />
    <EditDeleteButton className="w-40" />
    {allEntries.length > 1 && ( <VisualizeButton entries={allEntries} onClick={(entry) => { setEntryData(entry); setShowECM(true); setTimeout(() => { setShowECM(false); }, 5000); }} className="w-40" /> )}
    <DashboardButton className="w-40" />
    <LogoutButton onLogout={handleLogout} loading={logoutLoading} success={logoutSuccess} error={logoutError} className="w-40" />
  </div>
</CardNav>
</div>
<motion.div className="relative w-full px-0" animate={{ filter: isMenuOpen ? 'blur(5px)' : '', pointerEvents: isMenuOpen ? 'none' : 'auto' }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
      <div className="max-w-4xl mx-auto sm:space-y-12 space-y-6 px-4 pt-4">
        
        {/* Total Emissions */}
        <div className="group relative">
          <div className="absolute -inset-1  rounded-3xl bg-emerald-500/20 dark:bg-gray-100/10 blur-xl pointer-events-none transition-all duration-500 group-hover:blur-2xl" />
          <AnimatedHeadline />
          <motion.div
            className="relative bg-gray-50 mt-8 dark:bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg text-center transition-transform duration-500 group-hover:scale-105"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
            <h2 className="sm:text-3xl md:text-5xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider  mb-2 text-emerald-500 dark:text-gray-100"><span className="calendar-wrapper calendar-spark">🗓️ </span>Monthly Emissions</h2>

          {(() => {
            const [intPart, decimalPart] = total.toFixed(2).split('.');
            return (
              <p className="sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-normal sm:tracking-wider text-emerald-500 dark:text-gray-100">
                {intPart}
                <span className="hidden sm:inline">.{decimalPart}</span> kg CO<span
            className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
            style={{ '--random': Math.random() }}
          >
          2
          </span><br />
              </p>
            );
          })()}

{weatherRequested && data && weatherTimestamp ? (
  <div className="mt-4 space-y-4">
    {/* Weather expiry countdown */}
    <div className="text-center text-xs text-gray-400 mb-2">
  <WeatherCountdown 
    weatherTimestamp={weatherTimestamp}
    onExpire={() => {
      setWeatherRequested(false);
      setData(null);
      setWeatherTimestamp(null);
      setShowRefreshButton(false);
    }}
  />
</div>
{!showRefreshButton && (
      <RefreshCountdown 
        weatherTimestamp={weatherTimestamp}
        onRefreshAvailable={handleRefreshAvailable}
      />
    )}
    
    {/* Weather Section */}
    <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl p-4 mb-6">
      <motion.div
        className="cursor-pointer"
        onClick={() => setExpandedWeatherSection(prev => prev === 'weather' ? null : 'weather')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-center gap-2 text-center">
          <h2 className="sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider text-emerald-500 dark:text-gray-100">
            🌤️ Weather
          </h2>
          <span className="text-emerald-500 dark:text-gray-100 sm:text-2xl">
            {expandedWeatherSection === 'weather' ? '▽' : '▷'}
          </span>
        </div>

        {/* Collapsed: Overall condition only */}
        {expandedWeatherSection !== 'weather' && (
          <div className="text-center mt-3">
            <div className="text-sm font-intertight font-extralight text-shadow-DEFAULT sm:text-2xl mb-2">
              {(() => {
                const code = data.weather?.weather_code || 0;
                if (code === 0) return '🌞';
                if (code <= 3) return '⛅';
                if (code <= 48) return '🌫️';
                if (code <= 67) return '🌧️';
                if (code <= 77) return '❄️';
                if (code <= 82) return '🌦️';
                if (code <= 86) return '🌨️';
                if (code <= 99) return '⛈️';
                return '🌤️';
              })()} 
              {(() => {
                const code = data.weather?.weather_code || 0;
                if (code === 0) return 'Clear sky';
                if (code <= 3) return 'Partly cloudy';
                if (code <= 48) return 'Foggy conditions';
                if (code <= 67) return 'Rainy weather';
                if (code <= 77) return 'Snow expected';
                if (code <= 82) return 'Rain showers';
                if (code <= 86) return 'Snow showers';
                if (code <= 99) return 'Thunderstorm';
                return 'Weather';
              })()}
            </div>
          </div>
        )}
      </motion.div>

      {/* Expanded*/}
      <motion.div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expandedWeatherSection === 'weather' ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="grid grid-rows-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 font-intertight font-light text-shadow-DEFAULT">
          {/* Temperature */}
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">🌡️</div>
            <div className="text-lg font-semibold text-white">
              {data.weather?.temperature_2m || 'N/A'}°C
            </div>
            <div className="text-xs text-gray-300">Temperature</div>
          </div>

          {/* Feels Like */}
          <div className="bg-white/10 rounded-xl p-3 text-center">
  <div className="text-2xl mb-1">
    {data.weather?.apparent_temperature !== undefined ? (
      data.weather.apparent_temperature < 0
        ? "🥶"
        : data.weather.apparent_temperature < 10
        ? "❄️"
        : data.weather.apparent_temperature < 20
        ? "🧥"
        : data.weather.apparent_temperature < 30
        ? "😊"
        : data.weather.apparent_temperature < 40
        ? "🫠"
        : "🥵"
    ) : (
      "🌡️"
    )}
  </div>

  <div className="text-lg font-semibold text-white">
    {data.weather?.apparent_temperature !== undefined
      ? `${data.weather.apparent_temperature}°C`
      : "N/A"}
  </div>

  <div className="text-xs text-gray-300">Feels Like</div>
</div>

          {/* Wind Speed */}
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">💨</div>
            <div className="text-lg font-semibold text-white">
              {data.weather?.windspeed_10m?.toFixed(1) || 'N/A'} km/h
            </div>
            <div className="text-xs text-gray-300">Wind Speed</div>
          </div>

          {/* Humidity */}
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">💧</div>
            <div className="text-lg font-semibold text-white">
              {data.weather?.relative_humidity_2m || 'N/A'}%
            </div>
            <div className="text-xs text-gray-300">Humidity</div>
          </div>

          {/* Visibility */}
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">👁️</div>
            <div className="text-lg font-semibold text-white">
              {data.weather?.visibility || 'N/A'} km
            </div>
            <div className="text-xs text-gray-300">Visibility</div>
          </div>

          {/* UV Index */}
          {data.weather?.uv_index !== undefined && data.weather.uv_index > 0 && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">☀️</div>
              <div className="text-lg font-semibold text-white">
                {data.weather.uv_index}
              </div>
              <div className="text-xs text-gray-300">UV Index</div>
            </div>
          )}

          {/* Rain Intensity */}
          {data.weather?.rain_intensity !== undefined && data.weather.rain_intensity > 0 && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🌧️</div>
              <div className="text-lg font-semibold text-white">
                {data.weather.rain_intensity.toFixed(1)} mm/h
              </div>
              <div className="text-xs text-gray-300">Rain Intensity</div>
            </div>
          )}

          {/* Precipitation Type */}
          {data.weather?.precipitation_type && data.weather.precipitation_type !== "None" && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">☔</div>
              <div className="text-lg font-semibold text-white">
                {data.weather.precipitation_type}
              </div>
              <div className="text-xs text-gray-300">Precipitation</div>
            </div>
          )}

          {/* Sunrise */}
          {data.weather?.sunrise_time && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🌅</div>
              <div className="text-lg font-semibold text-white">
                {new Date(data.weather.sunrise_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className="text-xs text-gray-300">Sunrise</div>
            </div>
          )}

          {/* Sunset */}
          {data.weather?.sunset_time && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🌇</div>
              <div className="text-lg font-semibold text-white">
                {new Date(data.weather.sunset_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className="text-xs text-gray-300">Sunset</div>
            </div>
          )}

          {/* Moon Phase */}
          {data.weather?.moon_phase_name && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🌙</div>
              <div className="text-lg font-semibold text-white">
                {data.weather.moon_phase_name}
              </div>
              <div className="text-xs text-gray-300">
                {(data.weather.moon_phase_value * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>

    {/* Air Quality Section */}
    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl p-4 mb-6">
      <motion.div
        className="cursor-pointer"
        onClick={() => setExpandedWeatherSection(prev => prev === 'airquality' ? null : 'airquality')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-center gap-2 text-center">
          <h2 className="sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider text-emerald-500 dark:text-gray-100">
            🌬️ Air Quality
          </h2>
          <span className="text-emerald-500 dark:text-gray-100 sm:text-2xl">
            {expandedWeatherSection === 'airquality' ? '▽' : '▷'}
          </span>
        </div>

        {/* Collapsed: Overall AQI only */}
        {expandedWeatherSection !== 'airquality' && (
          <div className="text-center mt-3">
            <div className="text-sm font-intertight font-extralight text-shadow-DEFAULT sm:text-2xl mb-2">
              {(() => {
                const pm25 = data.air_quality?.pm2_5 || 0;
                if (pm25 <= 12) return '🌟';
                if (pm25 <= 35) return '😊';
                if (pm25 <= 55) return '😐';
                if (pm25 <= 150) return '😷';
                return '☠️';
              })()}
              Overall: {(() => {
                const pm25 = data.air_quality?.pm2_5 || 0;
                if (pm25 <= 12) return 'Excellent';
                if (pm25 <= 35) return 'Good';
                if (pm25 <= 55) return 'Moderate';
                if (pm25 <= 150) return 'Poor';
                return 'Hazardous';
              })()}
            </div>
          </div>
        )}
      </motion.div>

      {/* Expanded: All air quality details in square boxes */}
      <motion.div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expandedWeatherSection === 'airquality' ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4">
          {/* Health Recommendation */}
          <div className="bg-white/10 rounded-xl p-4 text-center text-shadow-DEFAULT font-intertight font-light tracking-wide">
            <div className="text-sm text-white">
              {(() => {
                const pm25 = data.air_quality?.pm2_5 || 0;
                if (pm25 <= 12) return (
                  "🌟 Air quality is excellent! Perfect for outdoor activities, jogging, and spending time outside."
                );
                if (pm25 <= 35) return (
                  "😊 Good air quality. Safe for everyone including sensitive individuals."
                );
                if (pm25 <= 55) return (
                  "😐 Moderate air quality. Most people can enjoy outdoor activities, but very sensitive individuals might experience minor issues."
                );
                if (pm25 <= 150) return (
                  "😷 Poor air quality. People with respiratory conditions should limit outdoor exposure. Everyone else should reduce prolonged outdoor activities."
                );
                return (
                  "☠️ Hazardous air quality! Avoid outdoor activities. Stay indoors and use air purifiers if available."
                );
              })()}
            </div>
          </div>

          {/* Air Quality Metrics Grid */}
          <div className="grid sm:grid-cols-3 gap-3 grid-rows-1 font-intertight font-light text-shadow-DEFAULT">
            {/* PM2.5 */}
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🔬</div>
              <div className="text-lg font-semibold text-white">
                {data.air_quality?.pm2_5?.toFixed(1) || 'N/A'} μg/m³
              </div>
              <div className="text-xs text-gray-300">PM2.5</div>
            </div>

            {/* PM10 */}
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🌪️</div>
              <div className="text-lg font-semibold text-white">
                {data.air_quality?.pm10?.toFixed(1) || 'N/A'} μg/m³
              </div>
              <div className="text-xs text-gray-300">PM10</div>
            </div>

            {/* Carbon Monoxide */}
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">☠️</div>
              <div className="text-lg font-semibold text-white">
                {data.air_quality?.carbon_monoxide?.toFixed(0) || 'N/A'} μg/m³
              </div>
              <div className="text-xs text-gray-300">Carbon Monoxide</div>
            </div>

            {/* Ozone */}
            {data.air_quality?.ozone && (
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">🌍</div>
                <div className="text-lg font-semibold text-white">
                  {data.air_quality.ozone.toFixed(1)} μg/m³
                </div>
                <div className="text-xs text-gray-300">Ozone</div>
              </div>
            )}

            {/* Nitrogen Dioxide */}
            {data.air_quality?.nitrogen_dioxide && (
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">🚗</div>
                <div className="text-lg font-semibold text-white">
                  {data.air_quality.nitrogen_dioxide.toFixed(1)} μg/m³
                </div>
                <div className="text-xs text-gray-300">NO₂</div>
              </div>
            )}

            {/* Sulphur Dioxide */}
            {data.air_quality?.sulphur_dioxide && (
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">🏭</div>
                <div className="text-lg font-semibold text-white">
                  {data.air_quality.sulphur_dioxide.toFixed(1)} μg/m³
                </div>
                <div className="text-xs text-gray-300">SO₂</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>

    {/* Data Source Info */}
    <div className="text-center text-xs text-gray-400 mb-2">
    Data from: {data.source}
    {data.weather?.sunrise_time && ' + Sunrise-Sunset.org'}
    {data.weather?.moon_phase_name && ' + Astronomical Calculation'}
    {' • Location: ' + (data.location_source === 'browser' ? 'Device GPS' : 'IP Address')}
    {data.refreshed && ' • Force Refreshed'}
  </div>
    
    {/* Refresh button */}
    {showRefreshButton && (
      <div className="  justify-center">
        <WeatherButton 
          textMobile="Refresh Data" 
          textDesktop="Refresh Weather & AQI Data" 
          iconType="weather"
          onClick={() => fetchWeatherAndAqi(true)}
          loading={loadingWeather}
          expired={false}
        />
      </div>
    )}
  </div>
) : (
  <div className="mt-4 text-center">
    <div className="space-y-2">
      <div className="items-center">
        <WeatherButton 
          textDesktop="Get Weather & Air Quality Info" 
          textMobile="Get Weather Info"
          iconType="weather"
          onClick={handleGetWeatherInfo}
          loading={loadingWeather}
          expired={weatherRequested && data && isWeatherDataExpired()}
        />
      </div>
    </div>
  </div>
)}
          </motion.div>
        </div>
        
{/* Comparison */}
<div className="group relative">
  {/* Static glow */}
  <div className="absolute -inset-1 rounded-2xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

  <motion.div
    className="relative bg-gray-50 dark:bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg 
               transition-transform duration-500 group-hover:scale-105"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
    whileTap={{ scale: 0.97 }}
  >
    {/* Hover animated border */}
    <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 
                    group-hover:opacity-100 animate-borderFlow 
                    border-emerald-500 dark:border-gray-100 pointer-events-none" />

    <h3 className="sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider  mb-4 text-center text-emerald-500 dark:text-gray-100">
  
    <div
  className="relative inline-block"
  // adjust --angle to match the rocket tilt (e.g. "-35deg", "-45deg", "10deg", etc.)
  style={{ "--angle": "15deg" }}
>
  {/* Rocket */}
  <span
    className="inline-block relative z-20"
    //style={{ transform: "rotate(var(--angle))", display: "inline-block" }}
  >
    🚀
  </span>

  {/* Smoke wrapper */}
  <div
    className="absolute z-10 pointer-events-none"
    style={{
      left: "0px",
      top: "2px",
      width: "30px",
      height: "30px",
      transform: "rotate(var(--angle))",
      transformOrigin: "left top"
    }}
  >
    <span
      className="smoke-puff"
      style={{ left: "6px", top: "0px", fontSize: "14px", animationDelay: "0s" }}
    >
      ☁️
    </span>
    <span
      className="smoke-puff"
      style={{ left: "12px", top: "6px", fontSize: "12px", animationDelay: "0.18s" }}
    >
      ☁️
    </span>
    <span
      className="smoke-puff"
      style={{ left: "2px", top: "12px", fontSize: "10px", animationDelay: "0.36s" }}
    >
      ☁️
    </span>
  </div>

  <style>{`
    @keyframes smokeExit {
      0% {
        transform: translateX(0) translateY(0) scale(1);
        opacity: 0.85;
        filter: blur(0px);
      }
      60% {
        opacity: 0.35;
        filter: blur(0.6px);
      }
      100% {
        transform: translateX(-10px) translateY(36px) scale(1.2);
        opacity: 0;
        filter: blur(1.6px);
      }
    }
    .smoke-puff {
      position: absolute;
      display: inline-block;
      transform-origin: center;
      will-change: transform, opacity;
      animation: smokeExit 1.6s cubic-bezier(.22,.9,.37,1) infinite;
      pointer-events: none;
      user-select: none;
    }
  `}</style>
</div>
 {user?.name.split(' ')[0]} <span className="animate-pulse"> vs</span> Global Averages
    </h3>

    <VictoryChart
      domainPadding={{ x: 40 }}
      padding={{ top: 20, bottom: 40, left: 60, right: 30 }} 
      animate={{ duration: 1200, easing: "bounce" }}
    >
      <VictoryAxis
        style={{
          axis: { stroke: '#e5e7eb', strokeWidth: 1 }, // lighter axis line
          tickLabels: { fill: '#f3f4f6', fontSize: 14, fontWeight: 'bold' }, // bright text
          grid: { stroke: '#6b7280', strokeDasharray: '4,4', opacity: 0.5 } // subtle grid
        }}
      />
      <VictoryAxis
        dependentAxis
        scale="log"
        tickFormat={(x) => `${x} kg`}
        style={{
          axis: { stroke: '#e5e7eb', strokeWidth: 1 },
          tickLabels: { fill: '#f3f4f6', fontSize: 14, fontWeight: 'bold' },
          grid: { stroke: '#6b7280', strokeDasharray: '4,4', opacity: 0.5 }
        }}
      />
      <VictoryGroup offset={25} colorScale={['#34d399', '#f87171']}>
        <VictoryBar
          data={comparison}
          x="category"
          y={(datum) => datum.user + 20}
          labels={({ datum }) => `${entryData?.name || 'You'}: ${datum.user.toFixed(1)} kg`}
          className="sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-normal sm:tracking-wider"
          labelComponent={
            <VictoryTooltip
              flyoutStyle={{ fill: '#111827', stroke: '#34d399', strokeWidth: 1 }}
              style={{ fill: '#f3f4f6', fontSize: 12 }}
            />
          }
          animate={{ onLoad: { duration: 1000 } }}
          style={{ data: { fill: '#34d399', width: 18, cursor: 'pointer' } }}
        />
        <VictoryBar
          data={comparison}
          x="category"
          y={(datum) => datum.global + 50}
          labels={({ datum }) => `Global: ${datum.global.toFixed(1)} kg`}
          labelComponent={
            <VictoryTooltip
              flyoutStyle={{ fill: '#111827', stroke: '#f87171', strokeWidth: 1 }}
              style={{ fill: '#f3f4f6', fontSize: 12 }}
            />
          }
          animate={{ onLoad: { duration: 1000 } }}
          style={{ data: { fill: '#f87171', width: 18, cursor: 'pointer' } }}
        />
      </VictoryGroup>
    </VictoryChart>
  </motion.div>
</div>

{/* Pie Chart */}
<div className="group relative w-full">
  <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

  <motion.div
    className="relative bg-gray-50 dark:bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl px-4 pt-6 pb-2 rounded-2xl shadow-lg text-center transition-transform duration-500 group-hover:scale-105 overflow-visible"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />

    <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-0 text-emerald-500 dark:text-gray-100">
    <span className="pancake-wrapper pancake-steam">🥞</span>  Emission Breakdown CO₂( <span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
e
</span> )
    </h3>

    {/* Centered Responsive SVG Container */}
    <div className="w-full flex justify-center items-center overflow-visible sm:h-96">
      <VictoryPie
  width={400}
  height={400}
  innerRadius={80}
  padAngle={1.5}
  data={pieData.map((d, i) => ({
    ...d,
    customRadius:
      selectedIndex === null
        ? 160
        : selectedIndex === i
        ? 175
        : 150
  }))}
  x="x"
  y="y"
  radius={({ datum }) => datum.customRadius}
  colorScale={['#34d399', '#60a5fa', '#facc15', '#f87171']}
  labels={[]}
  labelComponent={<></>}
  animate={{
    duration: 400,
    easing: "cubicInOut",
    onLoad: { duration: 600 }
  }}
  style={{
    data: {
      fillOpacity: ({ index }) =>
        selectedIndex === null || selectedIndex === index ? 1 : 0.3,
      stroke: ({ index }) =>
        selectedIndex === index ? "#ffffff" : "#ffffff55",
      strokeWidth: ({ index }) =>
        selectedIndex === index ? 3 : 1,
      filter: ({ index }) =>
        selectedIndex === index
          ? "drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))"
          : "drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))",
      transition: "all 0.4s ease"
    }
  }}
  events={[
    {
      target: "data",
      eventHandlers: {
        onClick: () => {
          return [
            {
              target: "data",
              mutation: (props) => {
                  handleLegendClick(props.index);
                  return null;
                }
              }
          ];
        }
      }
    }
  ]}
/>

    </div>

    {/* Enhanced Legends Below Pie */}
    <div className="flex sm:flex-wrap justify-center mt-0 gap-4 sm:mb-3 mb-1">
  {pieData.map((item, index) => (
    <motion.div
      key={index}
      className="flex flex-col items-center " 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <motion.div
        onClick={(e) => {
          e.stopPropagation();
          handleLegendClick(index);
        }}
        className={`cursor-pointer text-sm md:text-base font-medium flex flex-col items-center
          ${selectedIndex === index
            ? 'text-emerald-400 dark:text-emerald-300 animate-pulse'
            : 'text-gray-800 dark:text-gray-200 hover:text-emerald-400 dark:hover:text-emerald-300'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          layout
          initial={false}
          animate={{
            scale: selectedIndex === index ? 1.15 : 1,
            color: selectedIndex === index ? '#34d399' : '',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          className={`-mb-2 transition-colors duration-300 ease-in-out sm:text-xl text-shadow-DEFAULT font-intertight font-light tracking-normal ${
            selectedIndex === index ? 'font-semibold' : 'font-normal'
          }`}
        >
          {item.x}
        </motion.span>

        {/* ✅ Always rendered, just fade in/out */}
        <motion.span
          initial={false}
          animate={{
            opacity: selectedIndex === index ? 1 : 0,
            scale: selectedIndex === index ? 1 : 0.9,
            y: selectedIndex === index ? 0 : -5,
          }}
          transition={{ duration: 0.3 }}
          className="text-xs mt-1 text-emerald-500 dark:text-emerald-400 h-4"
        >
          <span>
  {window.innerWidth < 640
    ? Math.round(item.y)
    : item.y.toFixed(1)}
</span>

        </motion.span>
      </motion.div>
    </motion.div>
  ))}
</div>

  </motion.div>
</div>

{/* Yearly Projection  */}
{total && (
<div className="group relative">
  <div className="absolute -inset-1 rounded-2xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />
  
  <motion.div
    className="relative bg-gray-50 dark:bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-105"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7, delay: 0.2 }}
  >
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
    
    <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-6 text-center text-emerald-500 dark:text-gray-100">
      <span className="animate-glow-up">📈</span> Yearly Projection
    </h3>

    {/* Current Year Summary */}
    <motion.div 
      className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl p-4 mb-6 text-center"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="sm:text-lg md:text-xl text-shadow-DEFAULT font-intertight font-medium text-white mb-2">
        {(() => {
          const currentMonth = new Date().getMonth(); // 0-11
          const currentYear = new Date().getFullYear();
          
          if (currentMonth === 0) { // January
            return `${currentYear}`;
          } else { // February to December
            return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
          }
        })()} Projected Total
      </div>
      <div className="sm:text-2xl md:text-3xl text-shadow-DEFAULT font-intertight font-bold">
        {(() => {
          const yearlyTonnes = yearly / 1000;
let style = { 
  color: 'text-green-400', 
  emoji: '🌱', 
  animation: 'animate-gentle-grow' 
};

if (yearlyTonnes > 4 && yearlyTonnes <= 7) {
  style = { color: 'text-yellow-400', emoji: '⚠️', animation: 'animate-warning-shake' };
} else if (yearlyTonnes > 7 && yearlyTonnes <= 10) {
  style = { color: 'text-orange-400', emoji: '🔥', animation: 'animate-flame-flicker' };
} else if (yearlyTonnes > 10) {
  style = { color: 'text-red-400', emoji: '💥', animation: 'animate-explode-pop' };
}

          
          const [intPart, decimalPart] = yearlyTonnes.toFixed(2).split('.');
          
          return (
            <>
              <span className={`${style.animation} ${style.color} text-2xl mr-2`}>{style.emoji}</span>
              <span className={style.color}>
                {intPart}
                <span className="hidden sm:inline">.{decimalPart}</span> tonnes CO
                <span className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[0.8em] align-sub" style={{ '--random': Math.random() }}>
                  2
                </span>
              </span>
            </>
          );
        })()}
      </div>
    </motion.div>

    {/* Interactive Chart */}
    <div 
      className="relative h-80 w-full bg-gray-800/30 rounded-xl p-4 overflow-hidden"
      style={{ 
        outline: 'none', 
        border: 'none',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none'
      }}
      onFocus={(e) => e.target.blur()}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
  data={yearlyChartData} // Use memoized data instead of inline calculation
>
          <CartesianGrid 
            strokeDasharray="4,4" 
            stroke="#6b7280" 
            opacity={0.5}
          />
          <XAxis 
            dataKey="monthName"
            stroke="#f3f4f6"
            fontSize={14}
            fontWeight="bold"
            style={{
              fill: '#f3f4f6'
            }}
          />
          <YAxis 
            stroke="#f3f4f6"
            fontSize={14}
            fontWeight="bold"
            style={{
              fill: '#f3f4f6'
            }}
            tickFormatter={(value) => `${value.toFixed(1)}t`}
          />
          <ResponsiveTooltip 
            contentStyle={{ 
              backgroundColor: '#111827', 
              border: '1px solid #34d399',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
            formatter={(value, name) => [
              `${value.toFixed(2)} t CO₂`,
              'Cumulative Emissions'
            ]}
            labelFormatter={(label, payload) => {
              const currentMonth = new Date().getMonth();
              const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                   'July', 'August', 'September', 'October', 'November', 'December'];
                                   
              if (payload && payload[0]) {
                const data = payload[0].payload;
                //return `${data.fullMonthName} - Total: ${data.cumulativeKg.toFixed(0)} kg`;
                return `${fullMonthNames[currentMonth]} - ${data.fullMonthName} : ${data.cumulativeKg.toFixed(0)} kg`;

              }
              return label;
            }}
          />
          
          {/* Main projection line */}
          <Line 
            type="monotone"
            dataKey="value"
            stroke="#34d399"
            strokeWidth={3}
            dot={{ 
              r: 4, 
              fill: '#34d399',
              stroke: '#ffffff',
              strokeWidth: 1
            }}
            activeDot={{ 
              r: 8, 
              fill: '#34d399',
              stroke: '#ffffff',
              strokeWidth: 2
            }}
            //isAnimationActive={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Chart Info */}
    <motion.div 
      className="mt-4 text-center text-sm text-gray-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <p>Starting from {(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
        return `${fullMonthNames[currentMonth]} ${currentYear}`;
      })()} • Probable yearly emission if you keep similar emissions monthly</p>
    </motion.div>
  </motion.div>
</div>
)}

{/* Leaderboard */}
<div className="group relative">
  <div className="absolute -inset-1 rounded-2xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none" />
  <motion.div
    className="relative bg-gray-50 dark:bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
  >
    <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 
                    group-hover:opacity-100 animate-borderFlow 
                    border-emerald-500 dark:border-gray-100 pointer-events-none" />
    <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-4 text-center text-emerald-500 dark:text-gray-100"><span className="animate-trophy-shine">🏆 </span>Leaderboard</h3>
    <div className="space-y-3">
      
      <motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <AnimatePresence>
    {leaderboard.map((u, i, arr) => {
      const max = arr[arr.length - 1]?.totalEmission || 1;
      const pct = Math.min((u.totalEmission / max) * 100, 100);
      const isMe = u.email === user?.email;
      const showIce = topIndexes.has(i);
      const showFire = bottomIndexes.has(i);

      return (
        <motion.div
          key={u.email}
          variants={itemVariants}
          exit="exit"
          className={`p-3 rounded-lg mb-3 sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-normal tracking-normal ${isMe ? 'bg-emerald-700/30' : 'bg-gray-800/40'}`}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => {
            setHoveredIndex(i);
            setTimeout(() => setHoveredIndex(null), 300);
          }}
          whileHover={{scale: 1.02}}
          whileTap={{scale: 0.98}}
        >
          <div className="flex items-center justify-between text-xs sm:text-base md:text-xl text-shadow-DEFAULT font-intertight font-normal tracking-normal mb-2">
            <span className="flex items-center gap-2">
              {i + 1}. {u.name.split(' ')[0]}{isMe && ' (You)'}
              <motion.div
                animate={{ scale: hoveredIndex === i ? 1.5 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Lottie
                  animationData={
                  u.totalEmission <= 350
                    ? IceAnimation
                    : u.totalEmission <= 700
                    ? SunAnimation
                    : u.totalEmission <= 1000
                    ? FireAnimation
                    : DragonAnimation
                }
                  className="w-8 h-8"
                  loop
                />
              </motion.div>
            </span>
            <span>{(() => {
  const [intPart, decimalPart] = u.totalEmission.toFixed(2).split('.');
  return (
    <p className="sm:text-lg md:text-2xl text-shadow-DEFAULT font-intertight font-normal sm:tracking-wider text-emerald-500 dark:text-gray-100">
      {intPart}
      <span className="hidden sm:inline">.{decimalPart}</span> kg CO<span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span>
    </p>
  );
})()}</span>
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className={`h-2 rounded-full relative overflow-hidden
              ${isMe ? 'bg-gradient-to-r from-green-300 to-green-500' :
                u.totalEmission <= 350 ? 'bg-gradient-to-r from-blue-300 to-blue-500' :
                u.totalEmission <= 700 ? 'bg-gradient-to-r from-yellow-300 to-yellow-500' :
                u.totalEmission <= 1000 ? 'bg-gradient-to-r from-red-300 to-red-500' :
                'bg-gradient-to-r from-purple-400 to-purple-600'}
            `}
          >
            <div className="absolute inset-0 animate-flowing-bar" />
          </motion.div>
        </motion.div>
      );
    })}
  </AnimatePresence>
</motion.div>


    </div>
  </motion.div>
</div>

    </div></motion.div>
    </PageWrapper>
  </motion.div>
);

};

export default ChartPage;
