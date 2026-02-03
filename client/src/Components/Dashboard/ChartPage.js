import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { AnimatePresence, motion } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import useAuthRedirect from 'hooks/useAuthRedirect';
import { VictoryChart, VictoryGroup, VictoryBar, VictoryAxis, VictoryTooltip, VictoryPie } from 'victory';
import API from 'api/api';
import calculateEmissions from 'utils/calculateEmissionsFrontend';
import Lottie from 'lottie-react';
import IceAnimation from 'animations/Ice.json';
import FireAnimation from 'animations/Fire.json';
import DragonAnimation from 'animations/Dragon.json';
import SunAnimation from 'animations/Sun.json';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Dot } from 'recharts';
import { select, zoom, scaleLinear } from 'd3';
import CardNav from 'Components/CardNav';  
import LottieLogo from 'Components/LottieLogoComponent';
import { NewEntryButton, EditDeleteButton, DashboardButton, WeatherButton, LogoutButton, VisualizeButton, ShowMoreButton } from 'Components/globalbuttons';

const globalAverages = {
  food: 140,
  transport: 110,
  electricity: 90,
  waste: 50,
};
const sentence = "Your  Emission  Trends";const words = sentence.split(" ");

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
  
const AnimatedHeadline = React.memo(() => {
  const [activeBurstIndex, setActiveBurstIndex] = useState(null);
  const [bursting, setBursting] = useState(false);
  const [fallingLetters, setFallingLetters] = useState([]);
  const [hoveredWordIndex, setHoveredWordIndex] = useState(null);
  const isMobile = window.innerWidth < 640;

  const triggerBurst = (index) => {
    if (isMobile) return; // disabled on mobile

    setActiveBurstIndex(index);
    setBursting(true);
    setTimeout(() => {
      setBursting(false);
      setActiveBurstIndex(null);
    }, 1800);
  };

  if (isMobile) {
    return (
      <h1 className=" text-4xl font-black font-germania text-white text-center tracking-wider text-shadow-DEFAULT">
        Your  Emission<br />Trends
      </h1>
    );
  }

  return (
    <div className="relative overflow-visible w-full flex justify-center items-center mt-2 sm:mb-4 mb-2 px-4">
        <motion.div
          className="flex sm:flex-nowrap flex-wrap justify-center gap-3 text-4xl sm:text-6xl md:text-8xl font-black font-germania tracking-widest text-shadow-DEFAULT text-white transition-colors duration-500"
        initial={false}
        animate={false}
      >
        {words.map((word, wordIndex) => (
          <motion.span
            key={wordIndex}
            onMouseEnter={() => setHoveredWordIndex(wordIndex)}
            onMouseLeave={() => setHoveredWordIndex(null)}
            onClick={() => {
              if (!bursting && activeBurstIndex === null) triggerBurst(wordIndex);
            }}
            animate={{
              scale: hoveredWordIndex === wordIndex ? 1.15 : 1,
              y: hoveredWordIndex === wordIndex ? -8 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              duration: 0.3
            }}
            className="relative inline-block cursor-pointer whitespace-nowrap"
            style={{
              filter: hoveredWordIndex === wordIndex 
                ? 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.6))' 
                : 'none',
              transition: 'filter 0.3s ease'
            }}
          >
            {word.split("").map((char, i) => {
              const allChars = sentence.replace(/\s/g, "").split("");
              const charIndex = allChars.findIndex(
                (_, idx) => idx === i + words.slice(0, wordIndex).join("").length
              );

              const isBursting = activeBurstIndex === wordIndex;
              const isHovered = hoveredWordIndex === wordIndex;
              const randomDelay = Math.random() * 0.5 + i * 0.05;

              return (
                <AnimatePresence key={`${char}-${i}`}>
                  <motion.span
                    className="inline-block relative whitespace-nowrap"
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
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
                        : isHovered
                        ? {
                            y: [0, -3, 0],
                            rotate: [0, i % 2 === 0 ? 5 : -5, 0],
                            transition: {
                              duration: 0.4,
                              delay: i * 0.03,
                              ease: "easeInOut",
                            },
                          }
                        : fallingLetters.includes(charIndex)
                        ? "reenter"
                        : "initial"
                    }
                    variants={getLetterVariants()}
                  >
                    {char === "o" && wordIndex === 2 ? (
                      <span className="block">{char}</span>
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

  if (timeLeft <= 0) return " ";

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

    updateTimer();
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
const getAqiGradient = (pm25) => {
  if (pm25 <= 12) {
    // Excellent
    return "bg-gradient-to-r from-emerald-400/20 via-teal-400/15 to-cyan-400/20";
  }

  if (pm25 <= 35) {
    // Good
    return "bg-gradient-to-r from-sky-400/20 via-cyan-400/15 to-teal-400/20";
  }

  if (pm25 <= 55) {
    // Moderate
    return "bg-gradient-to-r from-slate-300/20 via-sky-300/15 to-cyan-400/20";
  }

  if (pm25 <= 150) {
    // Poor
    return "bg-gradient-to-r from-amber-400/20 via-orange-400/15 to-rose-400/20";
  }

  // Hazardous
  return "bg-gradient-to-r from-rose-500/25 via-orange-500/20 to-amber-500/20";
};
const getWeatherGradient = (code, uvIndex, visibility, temp) => {
  // Fog (highest priority for fog conditions)
  if (((code >= 45 && code <= 48) || code === 2100) && visibility < 1.5) {
    return "bg-gradient-to-r from-slate-400/20 via-gray-400/15 to-slate-500/20";
  }
  
  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return "bg-gradient-to-r from-purple-500/25 via-indigo-500/20 to-purple-600/25";
  }
  
  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return "bg-gradient-to-r from-cyan-400/20 via-blue-300/15 to-white/20";
  }
  
  // Rain
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return "bg-gradient-to-r from-blue-500/25 via-indigo-400/20 to-slate-500/20";
  }
  
  // Clear & Sunny (code 0 with high UV)
  if (code === 0 && uvIndex > 3) {
    return "bg-gradient-to-r from-yellow-400/25 via-orange-400/20 to-amber-500/25";
  }
  
  // Clear night (code 0 with low UV)
  if (code === 0 && uvIndex <= 3) {
    return "bg-gradient-to-r from-indigo-500/20 via-purple-400/15 to-blue-600/20";
  }
  
  // ⭐ NEW: HIGH UV takes priority (code 1-3 with UV >= 4)
  if (code <= 3 && uvIndex >= 4) {
    return "bg-gradient-to-r from-yellow-400/25 via-orange-400/20 to-amber-500/25";
  }
  
  // Partly cloudy with moderate UV (day)
  if (code <= 3 && uvIndex > 2) {
    return "bg-gradient-to-r from-sky-400/20 via-blue-400/15 to-cyan-400/20";
  }
  
  // Overcast/Cloudy (low UV)
  if (code <= 3 && uvIndex <= 2) {
    return "bg-gradient-to-r from-gray-400/20 via-slate-400/15 to-gray-500/20";
  }
  
  // Default: Pleasant weather
  return "bg-gradient-to-r from-indigo-400/20 via-blue-500/15 to-slate-500/20";
};
const ChartPage = () => {
  useAuthRedirect();
  const location = useLocation();
  const [entryData, setEntryData] = useState(location.state?.entry || null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [user, setUser] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const processed = useMemo(() => {
  if (!entryData) return null;
  
  // Prefer backend-calculated values (with capping)
  if (entryData.totalEmissionKg !== undefined && 
      entryData.foodEmissionKg !== undefined) {
    return {
      totalEmissionKg: entryData.totalEmissionKg,
      foodEmissionKg: entryData.foodEmissionKg,
      transportEmissionKg: entryData.transportEmissionKg,
      electricityEmissionKg: entryData.electricityEmissionKg,
      wasteEmissionKg: entryData.wasteEmissionKg
    };
  }
  
  return calculateEmissions(entryData);
}, [entryData]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [error, setError] = useState(null);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [userInfoError, setUserInfoError] = useState(null);
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
  const [weatherTimestamp, setWeatherTimestamp] = useState(() => {
  const stored = sessionStorage.getItem('weatherTimestamp'); return stored ? parseInt(stored) : null; });
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [allEntries, setAllEntries] = useState([]);
  const [showECM, setShowECM] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedLeaderboardUser, setExpandedLeaderboardUser] = useState(null);
  const [expandedLeaderboardCategory, setExpandedLeaderboardCategory] = useState(null);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const pm25 = data?.air_quality?.pm2_5 ?? 0;
  const aqiGradient = getAqiGradient(pm25);
  const [weatherRefreshSuccess, setWeatherRefreshSuccess] = useState(false);
  const weatherGradient = data?.weather 
  ? getWeatherGradient(
      data.weather.weather_code || 0,
      data.air_quality?.uv_index || 0,
      data.weather.visibility || 10,
      data.weather.temperature_2m || 20
    )
  : "bg-gradient-to-r from-indigo-400/20 via-blue-500/15 to-slate-500/20";
  const leaderboardRef = useRef(null);const [showBreakdown, setShowBreakdown] = useState(false);
  const [simTransport, setSimTransport] = useState(100);
  const [simDiet, setSimDiet] = useState(100);
  const [simElectricity, setSimElectricity] = useState(100);
  const [simWaste, setSimWaste] = useState(100); 
  const navigate = useNavigate();
const getDisplayError = () => {
  // Priority: 1. User Info (critical), 2. Leaderboard, 3. Weather, 4. General
  const errors = [
    { priority: 1, message: userInfoError, type: 'user' },
    { priority: 2, message: leaderboardError, type: 'leaderboard' },
    { priority: 3, message: weatherError, type: 'weather' },
    { priority: 4, message: error, type: 'general' }
  ].filter(e => e.message);

  // If multiple errors (2+), showing persistent combined message
  if (errors.length >= 2) {
    const errorTypes = errors.map(e => e.type).join(', ');
    return {
      message: `Multiple system errors detected (${errors.length}). Please refresh the page to resolve.`,
      isPersistent: true,
      count: errors.length
    };
  }

  // Returning highest priority error (auto-dismissable)
  return errors.length > 0 ? {
    message: errors[0].message,
    isPersistent: false,
    count: 1
  } : null;
};
const hoverTimeoutRef = useRef(null);
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

    lat = Math.round(pos.coords.latitude * 100) / 100;
    lon = Math.round(pos.coords.longitude * 100) / 100;
    } catch (err) {
      console.warn("Geolocation unavailable, using IP location");
    }
  }

  try {
    const params = new URLSearchParams();
    if (lat && lon) {
      params.append("lat", lat);
      params.append("lon", lon);
    }
    
    if (forceRefresh) {
      params.append("refresh", "true");
    }
    
    const queryString = params.toString();

    const res = await API.get(`/auth/weather-aqi?${queryString}`, { 
      headers: { "x-api-key": process.env.INTERNAL_API_KEY }
    });

    setData(res.data);
    setWeatherRequested(true);

    const backendTimestamp = res.data.timestamp ? new Date(res.data.timestamp).getTime() : Date.now();
    setWeatherTimestamp(backendTimestamp);
    sessionStorage.setItem('weatherTimestamp', backendTimestamp.toString());
    
    // **FIX: Reset refresh button state after successful refresh**
    if (forceRefresh) {
      setShowRefreshButton(false);
      setRefreshCooldown(600); // Reset to 10 minutes cooldown
      
      // **NEW: Show success message**
      setWeatherRefreshSuccess(true);
      setTimeout(() => {
        setWeatherRefreshSuccess(false);
      }, 3000);
    }
    
    if (res.data.refreshAllowedIn !== undefined) {
      setRefreshCooldown(res.data.refreshAllowedIn);
    } else {
      setRefreshCooldown(0);
    }
    } catch (err) {
    console.error("Failed to fetch weather data:", err);
    setWeatherError("Unable to fetch weather data. Please try again later.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setWeatherError(null), 5000);
  } finally {
    setLoadingWeather(false);
  }
}, []);
const isWeatherDataExpired = () => {
  if (!weatherTimestamp) return true;
  const thirtyMinutes = 30 * 60 * 1000;
  return (currentTime - weatherTimestamp) > thirtyMinutes;
};
const fetchWeatherDebounced = useRef(null);
const handleGetWeatherInfo = async () => {
  if (loadingWeather) return; // Preventing concurrent requests
  
  if (fetchWeatherDebounced.current) {
    clearTimeout(fetchWeatherDebounced.current);
  }
  
  fetchWeatherDebounced.current = setTimeout(async () => {
    await fetchWeatherAndAqi();
  }, 300);
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
      setUserInfoError(null); // Clear error on success
    } catch (err) {
      console.error('Failed to load user info:', err);
      setUserInfoError("Unable to load user information. Please refresh the page.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setUserInfoError(null), 5000);
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
const svgRef = useRef(null);
const chartRef = useRef(null);
const comparison = Object.keys(values).map(cat => ({ category: cat.charAt(0).toUpperCase() + cat.slice(1), user: values[cat], global: globalAverages[cat]  }));
const units = {
  food: 'kg',
  transport: 'km',
  electricity: 'kWh',
  waste: 'kg'
};
const pieData = Object.entries(values).map(([k, v]) => ({ 
  x: k.charAt(0).toUpperCase() + k.slice(1), 
  y: v, 
  unit: units[k.toLowerCase()] || 'kg',
  label: v != null ? `${k}: ${v.toFixed(1)} kg` : `${k}: No data`
}));
const yearly = total * 12;
const yearlyChartData = useMemo(() => { if (!total) return [];
const currentMonth = new Date(entryData?.createdAt || entryData?.updatedAt).getMonth(); // 0-11
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
const entryId = typeof entryData?._id === "string" ? entryData._id : entryData?._id?.$oid || entryData?._id?.toString();
useEffect(() => {
  if (!entryId) return;

  const controller = new AbortController();
  let isMounted = true;

  const fetchAllData = async () => {
    try {
      setError(null);

      const [entryRes, historyRes] = await Promise.all([
        API.get(`/footprint/${entryId}`, {
          withCredentials: true,
          signal: controller.signal
        }),
        API.get("/footprint/history", {
          withCredentials: true,
          signal: controller.signal
        })
      ]);

      if (!isMounted) return;

      setEntryData(entryRes.data);

      const sorted = [...historyRes.data].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );

      const index = sorted.findIndex(e => e._id === entryRes.data._id);

      if (index !== -1) {
        const lbRes = await API.get(`/footprint/leaderboard-nth?n=${index}`, {
          withCredentials: true,
          signal: controller.signal
        });

        if (isMounted) {
        setLeaderboard(lbRes.data || []);
        setLeaderboardError(null); // Clear error on success
      }
      }
    } catch (err) {
    if (isMounted && err.name !== "AbortError") {
      setLeaderboardError("Failed to load leaderboard data. Please refresh the page.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setLeaderboardError(null), 5000);
    }
  }
  };

  fetchAllData();

  return () => {
    isMounted = false;
    controller.abort();
  };
}, [entryId]);
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
  const getTimeOfDay = () => {
  const currentHour = new Date().getHours();
  return currentHour >= 6 && currentHour < 18 ? 'day' : 'night';
};
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
let topIndexes = new Set();
let bottomIndexes = new Set();
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
const [activePoint, setActivePoint] = useState(null);
useEffect(() => {
  if (activePoint) {
    const timer = setTimeout(() => setActivePoint(null), 3000);
    return () => clearTimeout(timer);
  }
}, [activePoint]);
useEffect(() => {
  if (expandedLeaderboardUser !== null && leaderboardRef.current) {
    const timer = setTimeout(() => {
      const items = leaderboardRef.current.querySelectorAll('[data-lb-item]');
      const expandedItem = items[expandedLeaderboardUser];
      
      if (expandedItem) {
        const rect = expandedItem.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.bottom > viewportHeight * 0.7) {
          expandedItem.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }
}, [expandedLeaderboardUser]);
useEffect(() => {
  // Only auto-clear if this is the ONLY error
  const errorCount = [userInfoError, leaderboardError, weatherError, error].filter(Boolean).length;
  
  if (leaderboardError && errorCount === 1) {
    const timer = setTimeout(() => setLeaderboardError(null), 5000);
    return () => clearTimeout(timer);
  }
}, [leaderboardError, userInfoError, weatherError, error]);

useEffect(() => {
  // Only auto-clear if this is the ONLY error
  const errorCount = [userInfoError, leaderboardError, weatherError, error].filter(Boolean).length;
  
  if (weatherError && errorCount === 1) {
    const timer = setTimeout(() => setWeatherError(null), 5000);
    return () => clearTimeout(timer);
  }
}, [weatherError, userInfoError, leaderboardError, error]);

useEffect(() => {
  // Only auto-clear if this is the ONLY error
  const errorCount = [userInfoError, leaderboardError, weatherError, error].filter(Boolean).length;
  
  if (userInfoError && errorCount === 1) {
    const timer = setTimeout(() => setUserInfoError(null), 5000);
    return () => clearTimeout(timer);
  }
}, [userInfoError, leaderboardError, weatherError, error]);

useEffect(() => {
  // Only auto-clear if this is the ONLY error
  const errorCount = [userInfoError, leaderboardError, weatherError, error].filter(Boolean).length;
  
  if (error && errorCount === 1) {
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }
}, [error, userInfoError, leaderboardError, weatherError]);
const displayedUsers = showAllLeaderboard ? leaderboard : leaderboard.slice(0, 10);
const hasMore = leaderboard.length > 10;
  if (!processed) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-full">
          <AnimatedHeadline />
          <p>Loading emissions data...</p>
        </div>
      </PageWrapper>
    );
  }
return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} style={{ touchAction: 'pan-y' }} className=" min-h-screen text-white">
    <PageWrapper backgroundImage="/images/chart-bk.webp" className="flex-1 flex flex-col">
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
    <DashboardButton className="w-40" />
    <NewEntryButton className="w-40" />
    {allEntries.length > 1 && ( <VisualizeButton entries={allEntries} onClick={(entry) => { setEntryData(entry); setShowECM(true); setTimeout(() => { setShowECM(false); }, 5000); }} className="w-40" /> )}
    <EditDeleteButton className="w-40" />
    <LogoutButton onLogout={handleLogout} loading={logoutLoading} success={logoutSuccess} error={logoutError} className="w-40" />
  </div>
</CardNav>
</div>
      <div className="max-w-4xl mx-auto sm:space-y-12 space-y-6 px-4 pt-4 pb-4">
        
        {/* Total Emissions & Heading */}
        <div className="group relative">
          <div className="absolute -inset-1  rounded-3xl bg-emerald-500/20 dark:bg-gray-100/10 blur-xl pointer-events-none transition-all duration-500 group-hover:blur-2xl" />
          <AnimatedHeadline />
        {(() => {
          const displayError = getDisplayError();
          if (!displayError) return null;
          return (
            <motion.div 
              className={`backdrop-blur-xl rounded-3xl p-4 border shadow-lg ${
                displayError.isPersistent 
                  ? 'bg-gradient-to-br from-red-500/20 via-orange-500/15 to-rose-500/20 border-red-400/40 shadow-red-500/10' 
                  : 'bg-gradient-to-br from-amber-400/15 via-orange-400/10 to-rose-400/15 border-amber-300/30 shadow-amber-500/10'
              }`}
              initial={{ opacity: 0, scale: 0.92, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="flex flex-col items-center gap-2">
                <p className={`font-intertight font-medium text-sm sm:text-lg text-center flex items-center justify-center gap-2 tracking-wide ${
                  displayError.isPersistent ? 'text-red-300' : 'text-amber-200'
                }`}>
                  <span className="text-xl animate-pulse">⚠️</span>
                  {displayError.message}
                </p>
                {displayError.isPersistent && (
                  <p className="text-xs text-red-400/80 font-intertight">
                    🔒 This error will persist until page refresh
                  </p>
                )}
              </div>
            </motion.div>
          );
        })()}
          <motion.div
            className="relative  mt-8  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg text-center transition-transform duration-500 group-hover:scale-105"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
            <h2 className="sm:text-3xl md:text-4xl text-base text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider  mb-2 text-emerald-500 dark:text-gray-100"><span className="calendar-wrapper calendar-spark">🗓️ </span>Total Monthly Emission</h2>

          {(() => {
            const [intPart, decimalPart] = (total ?? 0).toFixed(2).split('.');
            return (
              <p className="sm:text-2xl md:text-3xl text-shadow-DEFAULT font-intertight font-normal sm:tracking-wider text-emerald-500 dark:text-gray-100">
                {intPart}
                <span className="hidden sm:inline">.{decimalPart}</span> kg CO<span className="hidden sm:inline-block"><span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span></span>
<span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
  2
</span><br />
              </p>
            );
          })()}
    {/* Emission Breakdown (Expandable Section) */}
<div className="sm:mt-2 block">
  <motion.div
    className="cursor-pointer flex items-center justify-center gap-2 mb-3"
    onClick={() => setShowBreakdown(prev => !prev)}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  >
    <h3 className="text-base sm:text-xl font-intertight font-normal tracking-wide text-shadow-DEFAULT text-emerald-500 dark:text-gray-100 text-center">
      <span className="animate-chart-orbit text-2xl">📊</span> Emission Breakdown
    </h3>
    <span className="text-gray-100 text-xl">
      {showBreakdown ? "▷" : "▽"}
    </span>
  </motion.div>

  {/* Expand Container */}
  <motion.div
    className="overflow-visible"
    initial={false}
    animate={{
      height: showBreakdown ? "auto" : 0,
      opacity: showBreakdown ? 1 : 0,
      marginTop: showBreakdown ? 12 : 0
    }}
    transition={{ duration: 0.45, ease: "easeInOut" }}
  >
    {/* Category Grid */}
    <div className="grid grid-cols-1 gap-2 sm:relative">
       <div className="grid grid-cols-1 gap-2 sm:relative">
        {/* Food */}
        {processed.foodEmissionKg > 0 && (
          <motion.div
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer sm:col-span-1 transition-shadow duration-300"
            style={{ gridColumn: expandedCategory === 'food' ? '1 / -1' : 'auto' }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.3)',
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpandedCategory(prev => prev === 'food' ? null : 'food')}
            layout
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="animate-food-bowl text-2xl">🥗</span>
                <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                  Food
                </span>
              </div>
              <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                {(processed?.foodEmissionKg ?? 0).toFixed(1)} kg
              </span>
            </div>
            <motion.div
              initial={false}
              animate={{
                height: expandedCategory === 'food' ? 'auto' : 0,
                opacity: expandedCategory === 'food' ? 1 : 0
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {entryData?.food && (
                <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-1 pt-2 mt-2 border-t border-emerald-500/30">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{entryData.food.type}</span>
                    <span>{entryData.food.amountKg} kg</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Transport */}
        {processed.transportEmissionKg > 0 && (
          <motion.div
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer sm:col-span-1 transition-shadow duration-300"
            style={{ gridColumn: expandedCategory === 'transport' ? '1 / -1' : 'auto' }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.6), 0 0 50px rgba(6, 182, 212, 0.3)',
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpandedCategory(prev => prev === 'transport' ? null : 'transport')}
            layout
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="animate-car-drive text-2xl">🚗</span>
                <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                  Transport
                </span>
              </div>
              <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                {processed.transportEmissionKg.toFixed(1)} kg
              </span>
            </div>
            <motion.div
              initial={false}
              animate={{
                height: expandedCategory === 'transport' ? 'auto' : 0,
                opacity: expandedCategory === 'transport' ? 1 : 0
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {entryData?.transport && entryData.transport.length > 0 && (
                <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-blue-500/30">
                  {entryData.transport.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="font-medium">{t.mode}</span>
                      <span>{t.distanceKm} km</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Electricity */}
        {processed.electricityEmissionKg > 0 && (
          <motion.div
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer sm:col-span-1 transition-shadow duration-300"
            style={{ gridColumn: expandedCategory === 'electricity' ? '1 / -1' : 'auto' }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: '0 0 25px rgba(249, 115, 22, 0.6), 0 0 50px rgba(249, 115, 22, 0.3)',
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpandedCategory(prev => prev === 'electricity' ? null : 'electricity')}
            layout
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="animate-electricity text-2xl">⚡</span>
                <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                  Electricity
                </span>
              </div>
              <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                {processed.electricityEmissionKg.toFixed(1)} kg
              </span>
            </div>
            <motion.div
              initial={false}
              animate={{
                height: expandedCategory === 'electricity' ? 'auto' : 0,
                opacity: expandedCategory === 'electricity' ? 1 : 0
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {entryData?.electricity && entryData.electricity.length > 0 && (
                <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-yellow-500/30">
                  {entryData.electricity.map((e, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="font-medium">{e.source}</span>
                      <span>{e.consumptionKwh} kWh</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Waste */}
        {processed.wasteEmissionKg > 0 && (
          <motion.div
            className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer sm:col-span-1 transition-shadow duration-300"
            style={{ gridColumn: expandedCategory === 'waste' ? '1 / -1' : 'auto' }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: '0 0 25px rgba(236, 72, 153, 0.6), 0 0 50px rgba(236, 72, 153, 0.3)',
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpandedCategory(prev => prev === 'waste' ? null : 'waste')}
            layout
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="animate-waste-bin text-2xl">🗑️</span>
                <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                  Waste
                </span>
              </div>
              <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                {processed.wasteEmissionKg.toFixed(1)} kg
              </span>
            </div>
            <motion.div
              initial={false}
              animate={{
                height: expandedCategory === 'waste' ? 'auto' : 0,
                opacity: expandedCategory === 'waste' ? 1 : 0
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {entryData?.waste && entryData.waste.length > 0 && (
                <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-red-500/30">
                  {entryData.waste.map((w, idx) => (
                    <div key={idx} className="space-y-1">
                      {w.plasticKg > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Plastic:</span>
                          <span className="font-medium">{w.plasticKg} kg</span>
                        </div>
                      )}
                      {w.paperKg > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Paper:</span>
                          <span className="font-medium">{w.paperKg} kg</span>
                        </div>
                      )}
                      {w.foodWasteKg > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Food Waste:</span>
                          <span className="font-medium">{w.foodWasteKg} kg</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  </motion.div>
</div>
          </motion.div>
        </div>

{/* Comparison */}
<div className="group relative">
  {/* Static glow */}
  <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

  <motion.div
    className="relative  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg 
               transition-transform duration-500 group-hover:scale-105"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
    whileTap={{ scale: 0.97 }}
  >
    {/* Hover animated border */}
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 
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
 {user?.name.split(' ')[0]} <span className="text-white"> v<span className="animate-vs-slash">/</span>s</span> Global Averages
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
    className="relative  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl px-4 pt-6 pb-2 rounded-3xl shadow-lg text-center transition-transform duration-500 group-hover:scale-105 overflow-visible"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />

    <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-0 text-emerald-500 dark:text-gray-100">
    <span className="pancake-wrapper pancake-steam">🥞</span>  Emission Breakdown CO₂( <span className="hidden sm:inline-block text-white"><span
            className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
            style={{ '--random': Math.random() }}
          >
          e
          </span></span>
          <span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
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
            : 'text-emerald-500 dark:text-gray-200 hover:text-emerald-400 dark:hover:text-emerald-300'}`}
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
        {item.x} <span className="text-xs opacity-70">({item.unit})</span>
      </motion.span>

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

{/* Leaderboard */}
<div className="group relative">
  <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none" />
  <motion.div
    className="relative  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
  >
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 
                    group-hover:opacity-100 animate-borderFlow 
                    border-emerald-500 dark:border-gray-100 pointer-events-none" />
    <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-4 text-center text-emerald-500 dark:text-gray-100"><span className="animate-trophy-shine">🏆 </span>Leaderboard</h3>
    <div ref={leaderboardRef} className="space-y-3">
      
      <motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <AnimatePresence>
{displayedUsers.map((u, i, arr) => {
  const max = arr[arr.length - 1]?.totalEmission || 1;
  const pct = Math.min((u.totalEmission / max) * 100, 100);
  const isMe = u.isCurrentUser;
  const isExpanded = expandedLeaderboardUser === i;
  const userProcessed = u.entry ? calculateEmissions(u.entry) : null;

  return (
    <motion.div
      key={u.email}
      className="relative"
      data-lb-item
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.2 },
      }}
    >
      <motion.div
        layout="position"
        className={`relative p-3 rounded-3xl mb-3 cursor-pointer sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-normal tracking-normal ${
          isMe ? 'bg-emerald-700/30' : 'bg-gray-800/40'
        }`}
        onMouseEnter={() => {
  clearTimeout(hoverTimeoutRef.current);
  hoverTimeoutRef.current = setTimeout(() => setHoveredIndex(i), 50);
}}
onMouseLeave={() => {
  clearTimeout(hoverTimeoutRef.current);
  setHoveredIndex(null);
}}
        onClick={(e) => {
          if (e.target.closest('.category-item')) return;
          e.stopPropagation();
          setExpandedLeaderboardUser(isExpanded ? null : i);
          setExpandedLeaderboardCategory(null);
        }}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between text-xs sm:text-base md:text-xl text-shadow-DEFAULT font-intertight font-normal tracking-normal mb-2">
            <span className="flex items-center gap-2">
            {/* Rank number */}
            <span className="text-gray-400 min-w-[2ch]">{i + 1}.</span>
            
            {/* Name */}
            <span className="truncate">
              {u.name.split(' ')[0]}{isMe && ''}
            </span>
            <motion.div
              animate={{ 
                scale: hoveredIndex === i ? 1.3 : 1,
                rotate: hoveredIndex === i ? [0, -10, 10, -10, 0] : 0
              }}
              transition={{ 
                scale: { type: 'spring', stiffness: 300, damping: 15 },
                rotate: { duration: 0.5, ease: "easeInOut" }
              }}
            >
              <Lottie
                animationData={
                  u.totalEmission <= 300
                    ? IceAnimation
                    : u.totalEmission <= 450
                    ? SunAnimation
                    : u.totalEmission <= 800
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
                <span className="hidden sm:inline">.{decimalPart}</span> kg CO<span className="hidden sm:inline-block"><span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span></span>
<span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
  2
</span>
              </p>
            );
          })()}</span>
        </div>

        <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: i * 0.05 }}
            className={`h-full rounded-full relative overflow-hidden
              ${isMe ? 'bg-gradient-to-r from-green-300 to-green-500' :
                u.totalEmission <= 300 ? 'bg-gradient-to-r from-blue-300 to-blue-500' :
                u.totalEmission <= 450 ? 'bg-gradient-to-r from-yellow-300 to-yellow-500' :
                u.totalEmission <= 800 ? 'bg-gradient-to-r from-red-300 to-red-500' :
                'bg-gradient-to-r from-purple-400 to-purple-600'}
            `}
          >
            <div className="absolute inset-0 animate-flowing-bar" />
          </motion.div>
        </div>

        {/* Expanded Breakdown Section */}
        <AnimatePresence mode="wait">
          {isExpanded && userProcessed && u.entry && (
            <motion.div
              key="breakdown"
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: 'auto', 
                opacity: 1,
                transition: {
                  height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.3, delay: 0.1 }
                }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                transition: {
                  height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.2 }
                }
              }}
              className="overflow-visible hidden sm:block"
            >
              <div className="mt-4 space-y-2">
                {/* Food */}
                {userProcessed.foodEmissionKg > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="category-item bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer transition-shadow duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedLeaderboardCategory(prev => prev === `${i}-food` ? null : `${i}-food`);
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.3)',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="animate-food-bowl text-2xl">🥗</span>
                        <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                          Food
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                        {userProcessed.foodEmissionKg.toFixed(1)} kg
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedLeaderboardCategory === `${i}-food` && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          {u.entry?.food && (
                            <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-1 pt-2 mt-2 border-t border-emerald-500/30">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{u.entry.food.type}</span>
                                <span>{u.entry.food.amountKg} kg</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Transport */}
                {userProcessed.transportEmissionKg > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="category-item bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer transition-shadow duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedLeaderboardCategory(prev => prev === `${i}-transport` ? null : `${i}-transport`);
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: '0 0 25px rgba(6, 182, 212, 0.6), 0 0 50px rgba(6, 182, 212, 0.3)',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="animate-car-drive text-2xl">🚗</span>
                        <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                          Transport
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                        {userProcessed.transportEmissionKg.toFixed(1)} kg
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedLeaderboardCategory === `${i}-transport` && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          {u.entry?.transport && u.entry.transport.length > 0 && (
                            <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-blue-500/30">
                              {u.entry.transport.map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <span className="font-medium">{t.mode}</span>
                                  <span>{t.distanceKm} km</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Electricity */}
                {userProcessed.electricityEmissionKg > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="category-item bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer transition-shadow duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedLeaderboardCategory(prev => prev === `${i}-electricity` ? null : `${i}-electricity`);
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: '0 0 25px rgba(249, 115, 22, 0.6), 0 0 50px rgba(249, 115, 22, 0.3)',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="animate-electricity text-2xl">⚡</span>
                        <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                          Electricity
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                        {userProcessed.electricityEmissionKg.toFixed(1)} kg
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedLeaderboardCategory === `${i}-electricity` && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          {u.entry?.electricity && u.entry.electricity.length > 0 && (
                            <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-yellow-500/30">
                              {u.entry.electricity.map((e, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <span className="font-medium">{e.source}</span>
                                  <span>{e.consumptionKwh} kWh</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Waste */}
                {userProcessed.wasteEmissionKg > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="category-item bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer transition-shadow duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedLeaderboardCategory(prev => prev === `${i}-waste` ? null : `${i}-waste`);
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: '0 0 25px rgba(236, 72, 153, 0.6), 0 0 50px rgba(236, 72, 153, 0.3)',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="animate-waste-bin text-2xl">🗑️</span>
                        <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                          Waste
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                        {userProcessed.wasteEmissionKg.toFixed(1)} kg
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedLeaderboardCategory === `${i}-waste` && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          {u.entry?.waste && u.entry.waste.length > 0 && (
                            <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-red-500/30">
                              {u.entry.waste.map((w, idx) => (
                                <div key={idx} className="space-y-1">
                                  {w.plasticKg > 0 && (
                                    <div className="flex justify-between items-center">
                                      <span>Plastic:</span>
                                      <span className="font-medium">{w.plasticKg} kg</span>
                                    </div>
                                  )}
                                  {w.paperKg > 0 && (
                                    <div className="flex justify-between items-center">
                                      <span>Paper:</span>
                                      <span className="font-medium">{w.paperKg} kg</span>
                                    </div>
                                  )}
                                  {w.foodWasteKg > 0 && (
                                    <div className="flex justify-between items-center">
                                      <span>Food Waste:</span>
                                      <span className="font-medium">{w.foodWasteKg} kg</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
})}

{/* Showing More/Less Controls - appears after the last displayed user */}

{hasMore && (
  <motion.div
    className="flex flex-col items-center mt-4 mb-6 gap-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {/* Preview of next entry when collapsed */}
    <AnimatePresence mode="wait">
      {!showAllLeaderboard && leaderboard[10] && (
        <motion.div
          onClick={() => setShowAllLeaderboard(true)}
          className="relative w-full cursor-pointer group"
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 0.4, y: 0, height: 'auto', filter: 'blur(2px)' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          whileHover={{ opacity: 0.7, filter: 'blur(1px)', scale: 1.01 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-between bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 font-medium text-sm">11.</span>
              <span className="text-gray-200 font-medium text-sm sm:text-base">
                {leaderboard[10].name.split(' ')[0]}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-gray-400">
              {leaderboard[10].totalEmission.toFixed(2)} kg CO₂
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Animated dots */}
    <AnimatePresence mode="wait">
      {!showAllLeaderboard && (
        <motion.div
          className="flex justify-center items-center py-3 cursor-pointer"
          onClick={() => setShowAllLeaderboard(true)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-3 items-center justify-center">
            {[0, 1, 2].map((dotIdx) => (
              <motion.span
                key={dotIdx}
                className="w-3.5 h-3.5 bg-white rounded-full shadow-md"
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: dotIdx * 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Show More/Less Button - wrapped in a stable container */}
    <div className="w-full flex justify-center">
      <ShowMoreButton
        showAll={showAllLeaderboard}
        totalCount={leaderboard.length}
        visibleCount={10}
        onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
      />
    </div>
  </motion.div>
)}

  </AnimatePresence>
</motion.div>


    </div>
  </motion.div>
</div>

{/* Yearly Projection  */}
{total && (
<div className="group relative">
  <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />
  
  <motion.div
    className="relative  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-105"
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
      <div className="sm:text-lg md:text-xl text-shadow-DEFAULT font-intertight font-medium text-emerald-500 dark:text-white mb-2">
        {(() => {
          const entryDate = new Date(entryData.createdAt || entryData.updatedAt);
const currentMonth = entryDate.getMonth(); // 0-11
const currentYear = entryDate.getFullYear();
          
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
                <span className="hidden sm:inline-block"><span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span></span>
<span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
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
              const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                   
              if (payload && payload[0]) {
                const data = payload[0].payload;
                return `${fullMonthNames[currentMonth]} -> ${data.fullMonthName} : ${data.cumulativeKg.toFixed(0)} kg`;

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
        const entryDate = new Date(entryData.createdAt || entryData.updatedAt);
const currentMonth = entryDate.getMonth();
const currentYear = entryDate.getFullYear();
        const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
        return `${fullMonthNames[currentMonth]} ${currentYear}`;
      })()} • Probable yearly emission if you keep similar emissions monthly</p>
    </motion.div>
  </motion.div>
</div>
)}

{/* Milestones & Achievements */}
<div className="group relative hidden sm:block">
  <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />
  
  <motion.div
    className="relative  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-105"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
  >
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
    
    <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-6 text-center text-emerald-500 dark:text-gray-100">
      <span className="animate-trophy-shine">🏆</span> Achievements
    </h3>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-shadow-DEFAULT tracking-wide font-intertight">
      {(() => {
        const badges = [];
        const yearlyTonnes = yearly / 1000;
        const isTopPerformer = leaderboard.findIndex(u => u.email === user?.email) < leaderboard.length * 0.1;
        
        // Top 10% Badge
        if (isTopPerformer) {
          badges.push({
            emoji: '🏆',
            emojiClass: 'animate-trophy',
            title: 'Top 10%',
            desc: 'Elite Performer',
            color: 'from-yellow-500/20 to-amber-500/20'
          });
        }

        // Low Emissions Badge
        if (yearlyTonnes <= 4) {
          badges.push({
            emoji: '🌱',
            emojiClass: 'animate-seedling',
            title: 'Eco Champion',
            desc: 'Sustainably Low',
            color: 'from-green-500/20 to-emerald-500/20'
          });
        }

        // Travel Efficiency Badge
        if (processed.transportEmissionKg < 80) {
          badges.push({
            emoji: '🚶',
            emojiClass: 'animate-walk',
            title: 'Green Traveler',
            desc: 'Low Transport',
            color: 'from-blue-500/20 to-cyan-500/20'
          });
        }

        // Energy Saver Badge
        if (processed.electricityEmissionKg < 70) {
          badges.push({
            emoji: '⚡',
            emojiClass: 'animate-electric',
            title: 'Energy Saver',
            desc: 'Low Power Use',
            color: 'from-yellow-500/20 to-orange-500/20'
          });
        }

        // Locked Badge
        while (badges.length < 4) {
          badges.push({
            emoji: '🔒',
            emojiClass: 'animate-lock', // or animate-lock-shield
            title: 'Locked',
            desc: 'Keep improving',
            color: 'from-gray-500/20 to-gray-600/20',
            locked: true
          });
        }
        
        return badges.map((badge, i) => (
          <motion.div
            key={i}
            className={`bg-gradient-to-r ${badge.color} rounded-xl p-4 text-center backdrop-blur-sm ${!badge.locked ? 'cursor-pointer' : 'opacity-50'}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={!badge.locked ? { scale: 1.05 } : {}}
            whileTap={!badge.locked ? { scale: 0.95 } : {}}
          >
            <div className={`text-4xl mb-2 ${badge.emojiClass || ''}`}>
              {badge.emoji}
            </div>
            <div className="text-sm sm:text-base font-medium text-emerald-500 dark:text-white mb-1">{badge.title}</div>
            <div className="text-xs text-gray-300">{badge.desc}</div>
          </motion.div>
        ));
      })()}
    </div>
  </motion.div>
</div>

{/* Weather and AQI */}
<div className="group relative">
  {/* Static glow */}
  <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

  <motion.div
    className="relative  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg 
               transition-transform duration-500 group-hover:scale-105"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
    whileTap={{ scale: 0.97 }}
  >
    {/* Hover animated border */}
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 
                    group-hover:opacity-100 animate-borderFlow 
                    border-emerald-500 dark:border-gray-100 pointer-events-none" />
                    <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-4 text-center text-emerald-500 dark:text-gray-100"><span className="animate-weather-drift">🌦️</span>Weather and AQI</h3>
{weatherRequested && data && weatherTimestamp ? (
  <div className="mt-4 space-y-4">
    {/* Weather Section */}
    <motion.div
      key={weatherGradient}
      initial={{ opacity: 0.6, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`${weatherGradient} rounded-3xl p-4 mb-6 backdrop-blur-md`}
    >
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
        const uvIndex = data.air_quality?.uv_index || 0;
        const visibility = data.weather?.visibility || 10;
        
        // STRICT fog detection: MUST have both low visibility AND low UV
        // Tomorrow.io fog code: 2100
        // Open-Meteo fog codes: 45-48
        const isFogCode = (code >= 45 && code <= 48) || code === 2100;
        const isFoggy = isFogCode && visibility < 1.5 && uvIndex < 2;
        
        // Emoji selection
        if (isFoggy) return '🌫️';
        if (code === 0) return uvIndex > 3 ? '☀️' : '🌙';
        if (code <= 3) return uvIndex > 2 ? '⛅' : '☁️';
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
        if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '❄️';
        if (code >= 95 && code <= 99) return '⛈️';
        return uvIndex > 3 ? '🌤️' : '☁️';
      })()} 
      {(() => {
        const code = data.weather?.weather_code || 0;
        const uvIndex = data.air_quality?.uv_index || 0;
        const visibility = data.weather?.visibility || 10;
        
        // STRICT fog detection: MUST have both low visibility AND low UV
        // Tomorrow.io fog code: 2100
        // Open-Meteo fog codes: 45-48
        const isFogCode = (code >= 45 && code <= 48) || code === 2100;
        const isFoggy = isFogCode && visibility < 1.5 && uvIndex < 2;
        
        // Condition text
        if (isFoggy) return 'Foggy conditions';
        if (code === 0) return uvIndex > 3 ? 'Clear and sunny' : 'Clear night';
        if (code <= 3) return uvIndex > 2 ? 'Partly cloudy' : 'Cloudy';
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rainy weather';
        if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Snow expected';
        if (code >= 95 && code <= 99) return 'Thunderstorm';
        return uvIndex > 3 ? 'Fair weather' : 'Overcast';
      })()}, {data.weather?.temperature_2m || 'N/A'}°C 
    </div>
  </div>
)}
      </motion.div>

      {/* Expanded*/}
      <motion.div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expandedWeatherSection === 'weather' ? 'max-h-[1500px] opacity-100 mt-6' : 'max-h-0 opacity-0'
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
          {getTimeOfDay() === 'day' && data.air_quality?.uv_index !== undefined && data.air_quality.uv_index > 0 && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">☀️</div>
              <div className="text-lg font-semibold text-white">
                {data.air_quality.uv_index}
              </div>
              <div className="text-xs text-gray-300">UV Index</div>
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
          {getTimeOfDay() === "night" && data.weather?.moonPhase && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              
              {/* Emoji */}
              <div className="text-2xl mb-1">
                {data.weather.moonPhase.emoji}
              </div>

              {/* Phase name */}
              <div className="text-lg font-semibold text-white">
                {data.weather.moonPhase.name}
              </div>
              <div className="text-xs text-gray-300">
                {data.weather.moonPhase.illumination}% illuminated
              </div>

            </div>
          )}

          {/* Rain Intensity */}
          {data.weather?.rain_intensity !== undefined && data.weather.rain_intensity > 0 && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">
                {data.weather.rain_intensity < 0.5 ? '🌦️' :
                data.weather.rain_intensity < 2 ? '🌧️' :
                data.weather.rain_intensity < 10 ? '⛈️' : '🌊'}
              </div>
              <div className="text-lg font-semibold text-white">
                {data.weather.rain_intensity.toFixed(1)} mm/h
              </div>
              <div className="text-xs text-gray-300">
                {data.weather.rain_intensity < 0.5 ? 'Light Drizzle' :
                data.weather.rain_intensity < 2 ? 'Moderate Rain' :
                data.weather.rain_intensity < 10 ? 'Heavy Rain' : 'Very Heavy Rain'}
              </div>
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

          {/* Precipitation Probability - Only show if significant rain */}
          {data.weather?.precipitation_probability !== undefined && 
          data.weather.precipitation_probability > 10 && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">💧</div>
              <div className="text-lg font-semibold text-white">
                {data.weather.precipitation_probability}%
              </div>
              <div className="text-xs text-gray-300">Rain Probability</div>
            </div>
          )}

          {/* Pressure Sea Level - Only show if significant rain */}
          {data.weather?.pressure_sea_level !== undefined && 
          data.weather.rain_intensity > 0.3 && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🌊</div>
              <div className="text-lg font-semibold text-white">
                {data.weather.pressure_sea_level.toFixed(1)} hPa
              </div>
              <div className="text-xs text-gray-300">Sea Level Pressure</div>
            </div>
          )}

          {/* Pressure Surface Level - Only show if significant rain */}
          {data.weather?.pressure_surface_level !== undefined && 
          data.weather.rain_intensity > 0.3 && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">📍</div>
              <div className="text-lg font-semibold text-white">
                {data.weather.pressure_surface_level.toFixed(1)} hPa
              </div>
              <div className="text-xs text-gray-300">Surface Pressure</div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>

    {/* Air Quality Section */}
    <motion.div
  key={aqiGradient}
  initial={{ opacity: 0.6, scale: 0.98 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  className={`${aqiGradient} rounded-3xl p-4 mb-6 backdrop-blur-md`}
>
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
  const aqi = Number(data?.air_quality?.aqi) || 0;

  if (aqi <= 50) return '🌟';       // Good
  if (aqi <= 100) return '😊';     // Moderate
  if (aqi <= 150) return '😐';     // Poor
  if (aqi <= 200) return '😷';     // Unhealthy
  if (aqi <= 300) return '🔥';     // Severe
  return '☠️';                     // Hazardous
})()}

{(() => {
  const aqi = Number(data?.air_quality?.aqi) || 0;

  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Poor';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Severe';
  return 'Hazardous';
})()} air quality  
, AQI: {data?.air_quality?.aqi ?? 'N/A'}
<span className="text-xs opacity-70">
  (US EPA Standard)
</span>
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
          <div className="bg-white/10 rounded-xl p-4 text-center text-shadow-DEFAULT font-intertight tracking-wide">
            <div className="text-sm text-white">
            {(() => {
              const aqi = Number(data?.air_quality?.aqi) || 0;

              if (aqi <= 50) return (
                "🌿 Good air quality. Perfect for outdoor activities and exercise."
              );

              if (aqi <= 100) return (
                "🙂 Moderate air quality. Sensitive individuals may feel slight discomfort."
              );

              if (aqi <= 150) return (
                "😐 Poor air quality. Children, elderly, and people with breathing issues should limit outdoor exposure."
              );

              if (aqi <= 200) return (
                "😷 Unhealthy air. Avoid prolonged outdoor activities. Wear a mask if needed."
              );

              if (aqi <= 300) return (
                "🔥 Severe air pollution. Stay indoors as much as possible."
              );

              return (
                "☠️ Hazardous air quality! Avoid going outside. Use air purifiers if available."
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
    </motion.div>

    {/* Data Source Info */}
    <div className="text-center text-xs text-gray-400 mb-2">
    Data from: {data.source}
    {data.weather?.sunrise_time && ' + Sunrise-Sunset.org'}
    {data.weather?.moon_phase_name && ' + Astronomical Calculation'}
    {' • Location: ' + (data.location_source === 'browser' ? 'Device GPS' : 'IP Address')}
    {data.refreshed && ' • Force Refreshed'}
  </div>

    {/* Success message after refresh */}
{weatherRefreshSuccess && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="text-center mb-3"
  >
    <div className="font-intertight inline-block bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium">
      ✅ Weather data refreshed successfully!
    </div>
  </motion.div>
)}

{/* Refresh button */}
{showRefreshButton && (
  <div className="justify-center">
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
  {!showRefreshButton && (
      <RefreshCountdown 
        weatherTimestamp={weatherTimestamp}
        onRefreshAvailable={handleRefreshAvailable}
      />
    )}
</div>
    </motion.div>
</div> 

{/* Emission Forecast Simulator */}
<div className="group relative hidden sm:block">
  <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />
  
  <motion.div
    className="relative  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-105"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
  >
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
    
    <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-6 text-center text-emerald-500 dark:text-gray-100">
      <span className="text-2xl animate-crystal-ball">🔮</span> What If
    </h3>

    {(() => {
      
      const scale = (value) => {
  if (value === 100) return 1; 
  return Math.pow(value / 100, 1.4);
};

const simulatedTotal = (
  processed.transportEmissionKg * scale(simTransport) +
  processed.foodEmissionKg * scale(simDiet) +
  processed.electricityEmissionKg * scale(simElectricity) +
  processed.wasteEmissionKg * scale(simWaste)
);

const foodSim = processed.foodEmissionKg * scale(simDiet);
const transportSim = processed.transportEmissionKg * scale(simTransport);
const electricitySim = processed.electricityEmissionKg * scale(simElectricity);
const wasteSim = processed.wasteEmissionKg * scale(simWaste);

      const difference = simulatedTotal - total;
      const percentChange = ((difference / total) * 100);
      const getPercentColor = (value) => {
  if (value === 100) return "rgb(255,255,255)"; // pure white

  if (value > 100) {
    // White → Red transition
    let intensity = Math.min((value - 100) / 100, 1);
    return `rgb(255, ${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * (1 - intensity))})`;
  } else {
    // White → Blue transition
    let intensity = Math.min((100 - value) / 100, 1);
    return `rgb(${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * (1 - intensity))}, 255)`;
  }
};
const getSliderStyle = (value) => ({
  accentColor: getPercentColor(value),        // thumb color
  background: `linear-gradient(
      90deg,
      ${getPercentColor(value)} ${value / 2}%, 
      #444 ${value / 2}%
    )`,
  transition: "all 0.3s ease",
});
      return (
        <>
          <div className="space-y-6 mb-6 text-shadow-DEFAULT tracking-wide font-intertight">
            
            {/* Food Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-white flex items-center gap-2">
                  <span className="animate-food-bowl">🥗</span> Food {foodSim.toFixed(1)} kg
                </span>
                <span
  className="text-sm sm:text-base font-semibold transition-colors duration-300"
  style={{ color: getPercentColor(simDiet) }}
>
  {simDiet}%
</span>
              </div>
              <input
  type="range"
  min="0"
  max="200"
  value={simDiet}
  onChange={(e) => setSimDiet(Number(e.target.value))}
  style={getSliderStyle(simDiet)}
  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
/>

            </div>
            
            {/* Transport Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-white flex items-center gap-2">
                  <span className="animate-car-drive">🚗</span> Transport {transportSim.toFixed(1)} kg
                </span>
                <span
  className="text-sm sm:text-base font-semibold transition-colors duration-300"
  style={{ color: getPercentColor(simTransport) }}
>
  {simTransport}%
</span>
              </div>
             <input
  type="range"
  min="0"
  max="200"
  value={simTransport}
  onChange={(e) => setSimTransport(Number(e.target.value))}
  style={getSliderStyle(simTransport)}
  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
/>
            </div>

            {/* Electricity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-white flex items-center gap-2">
                  <span className="animate-electricity">⚡</span> Electricity {electricitySim.toFixed(1)} kg
                </span>
                
                <span
  className="text-sm sm:text-base font-semibold transition-colors duration-300"
  style={{ color: getPercentColor(simElectricity) }}
>
  {simElectricity}%
</span>

              </div>
              <input
  type="range"
  min="0"
  max="200"
  value={simElectricity}
  onChange={(e) => setSimElectricity(Number(e.target.value))}
  style={getSliderStyle(simElectricity)}
  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
/>

            </div>

            {/* Waste Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-white flex items-center gap-2">
                  <span className="animate-waste-bin">🗑️</span> Waste {wasteSim.toFixed(1)} kg
                </span>
                <span
  className="text-sm sm:text-base font-semibold transition-colors duration-300"
  style={{ color: getPercentColor(simWaste) }}
>
  {simWaste}%
</span>

              </div>
              <input
  type="range"
  min="0"
  max="200"
  value={simWaste}
  onChange={(e) => setSimWaste(Number(e.target.value))}
  style={getSliderStyle(simWaste)}
  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
/>

            </div>
          </div>

          {/* Results */}
          <motion.div
            className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl text-shadow-DEFAULT tracking-wide font-intertight p-4 text-center"
            key={simulatedTotal}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-sm text-gray-300 mb-2">Simulated Monthly Total</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-500 dark:text-white mb-2">
              {simulatedTotal.toFixed(2)} kg CO<span className="hidden sm:inline-block"><span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span></span>
<span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
  2
</span>
            </div>
            <div className={`text-sm sm:text-base ${difference < 0 ? 'text-green-400' : difference > 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {difference < 0 ? '📉' : difference > 0 ? '📈' : '➡️'} 
              {' '}{Math.abs(difference).toFixed(2)} kg ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
              {difference < 0 ? ' saved!' : difference > 0 ? ' increase' : ' no change'}
            </div>
          </motion.div>
        </>
      );
    })()}
  </motion.div>
</div>

{/* Global Comparison */}
<div className="group relative">
  <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />
  
  <motion.div
    className="relative  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-105"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
  >
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
    
    <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-6 text-center text-emerald-500 dark:text-gray-100">
      <span className="text-2xl animate-earth">🌍</span> Global Context
    </h3>

    {(() => {
      const worldAvgMonthly = 400; // ~4 tonnes/year
      const indiaAvgMonthly = 200; // ~2 tonnes/year
      
      // Calculate user's percentage relative to each average
      const userToWorldRatio = (total / worldAvgMonthly) * 50; // 50% = average
      const userToIndiaRatio = (total / indiaAvgMonthly) * 50; // 50% = average
      
      const worldDiff = ((total - worldAvgMonthly) / worldAvgMonthly) * 100;
      const indiaDiff = ((total - indiaAvgMonthly) / indiaAvgMonthly) * 100;
      
      return (
        <div className="space-y-6">
          {/* World Average Section */}
          <motion.div
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl text-shadow-DEFAULT tracking-wide font-intertight p-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* World Average Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-earth">🌎</span>
                  <span className="text-sm sm:text-base text-white font-medium">World Average</span>
                </div>
                <span className="text-sm sm:text-base text-white text-shadow-DEFAULT mt-2 sm:mt-0 font-intertight sm:tracking-wide">
                  {(() => {
                    const [intPart, decimalPart] = worldAvgMonthly.toFixed(2).split('.');
                    return (
                      <>
                        {intPart}
                        <span className="hidden sm:inline">.{decimalPart}</span> kg CO
                        <span className="hidden sm:inline-block"><span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span></span>
<span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
  2
</span>
                      </>
                    );
                  })()}
                </span>
              </div>
              
              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-blue-300 to-blue-500"
                >
                  <div className="absolute inset-0 animate-flowing-bar" />
                </motion.div>
              </div>
            </div>

            {/* User vs World Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-cool-face">😎</span>
                  <span className="text-sm sm:text-base text-white font-medium">{user?.name.split(' ')[0]}</span>
                </div>
                <span className="text-sm sm:text-base text-white text-shadow-DEFAULT mt-2 sm:mt-0 font-intertight sm:tracking-wide">
                  {(() => {
                    const [intPart, decimalPart] = (total ?? 0).toFixed(2).split('.');
                    return (
                      <>
                        {intPart}
                        <span className="hidden sm:inline">.{decimalPart}</span> kg CO
                        <span className="hidden sm:inline-block"><span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span></span>
<span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
  2
</span>
                      </>
                    );
                  })()}
                </span>
              </div>
              
              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(userToWorldRatio, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-green-300 to-green-500"
                >
                  <div className="absolute inset-0 animate-flowing-bar" />
                </motion.div>
              </div>
              
              <div className={`text-sm text-center ${worldDiff < 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(worldDiff).toFixed(0)}% {worldDiff < 0 ? 'less ✨' : 'more 😢'} than world average
              </div>
            </div>
          </motion.div>

          {/* India Average Section */}
          <motion.div
            className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl text-shadow-DEFAULT tracking-wide font-intertight p-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* India Average Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-mosque">🕌</span>
                  <span className="text-sm sm:text-base text-white font-medium">India Average</span>
                </div>
                <span className="text-sm sm:text-base text-white text-shadow-DEFAULT mt-2 sm:mt-0 font-intertight sm:tracking-wide">
                  {(() => {
                    const [intPart, decimalPart] = indiaAvgMonthly.toFixed(2).split('.');
                    return (
                      <>
                        {intPart}
                        <span className="hidden sm:inline">.{decimalPart}</span> kg CO
                        <span className="hidden sm:inline-block"><span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span></span>
<span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
  2
</span>
                      </>
                    );
                  })()}
                </span>
              </div>
              
              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-yellow-300 to-orange-500"
                >
                  <div className="absolute inset-0 animate-flowing-bar" />
                </motion.div>
              </div>
            </div>

            {/* User vs India Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-cool-face">😎</span>
                  <span className="text-sm sm:text-base text-white font-medium">{user?.name.split(' ')[0]}</span>
                </div>
                <span className="text-sm sm:text-base text-white text-shadow-DEFAULT mt-2 sm:mt-0 font-intertight sm:tracking-wide">
                  {(() => {
                    const [intPart, decimalPart] = (total ?? 0).toFixed(2).split('.');
                    return (
                      <>
                        {intPart}
                        <span className="hidden sm:inline">.{decimalPart}</span> kg CO
                       <span className="hidden sm:inline-block"><span
  className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
  style={{ '--random': Math.random() }}
>
2
</span></span>
<span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
  2
</span>
                      </>
                    );
                  })()}
                </span>
              </div>
              
              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(userToIndiaRatio, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-green-300 to-green-500"
                >
                  <div className="absolute inset-0 animate-flowing-bar" />
                </motion.div>
              </div>
              
              <div className={`text-sm text-center ${indiaDiff < 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(indiaDiff).toFixed(0)}% {indiaDiff < 0 ? 'less 🌟' : 'more 😢'} than India average
              </div>
            </div>
          </motion.div>
        </div>
      );
    })()}
  </motion.div>
</div>
    </div>
    </PageWrapper>
  </motion.div>
);

};

export default ChartPage;
