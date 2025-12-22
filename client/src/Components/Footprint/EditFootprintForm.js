import API from 'api/api';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import useAuthRedirect from 'hooks/useAuthRedirect';
import { SaveChangesButton } from 'Components/globalbuttons';
import { EditDeleteButton, DashboardButton } from 'Components/globalbuttons';
import CardNav from 'Components/CardNav';  
import LottieLogo from 'Components/LottieLogoComponent';
import { boxglowRI } from 'utils/styles';

const sentence = "Revise Info";
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
    <div className="relative overflow-visible w-full flex justify-center items-center mt-4 px-4">
      <motion.div
        className="flex flex-wrap justify-center gap-3 text-4xl sm:text-6xl md:text-8xl font-black font-germania sm:tracking-widest tracking-wider text-shadow-DEFAULT text-white transition-colors duration-500"
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

const CustomSelect = ({ label, value, onChange, options, name, icon, showFactor = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const selectedIndex = options.findIndex(opt => opt.value === value);

  const emissionFactors = {
    'Animal based': 6.0,
    'Plant based': 1.5,
    'Both': 3.8,
    'Car': 0.192,
    'Bike': 0.016,
    'Bus': 0.089,
    'Metro': 0.041,
    'Train': 0.049,
    'Flights': 0.254,
    'Coal': 0.94,
    'Solar': 0.05,
    'Wind': 0.01,
    'Hydro': 0.02,
    'Mixed': 0.45
  };

  const getFactorLabel = (optionValue) => {
    const factor = emissionFactors[optionValue];
    if (!factor || !showFactor) return '';
    
    if (['Animal based', 'Plant based', 'Both'].includes(optionValue)) {
      return `${factor} kg CO₂/kg`;
    } else if (['Car', 'Bike', 'Bus', 'Metro', 'Train', 'Flights'].includes(optionValue)) {
      return `${factor} kg CO₂/km`;
    } else if (['Coal', 'Solar', 'Wind', 'Hydro', 'Mixed'].includes(optionValue)) {
      return `${factor} kg CO₂/kWh`;
    }
    return '';
  };

  const getOptionGlowColor = (index) => {
    const glowColors = [
      'rgba(239, 68, 68, 0.5)',
      'rgba(34, 197, 94, 0.5)',
      'rgba(59, 130, 246, 0.5)',
      'rgba(168, 85, 247, 0.5)',
      'rgba(236, 72, 153, 0.5)',
      'rgba(251, 191, 36, 0.5)',
      'rgba(6, 182, 212, 0.5)',
      'rgba(245, 158, 11, 0.5)',
    ];
    return glowColors[index % glowColors.length];
  };

  const getOptionBgColor = (index) => {
    const bgColors = [
      'rgba(239, 68, 68, 0.15)',
      'rgba(34, 197, 94, 0.15)',
      'rgba(59, 130, 246, 0.15)',
      'rgba(168, 85, 247, 0.15)',
      'rgba(236, 72, 153, 0.15)',
      'rgba(251, 191, 36, 0.15)',
      'rgba(6, 182, 212, 0.15)',
      'rgba(245, 158, 11, 0.15)',
    ];
    return bgColors[index % bgColors.length];
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          boxShadow: selectedOption && !isOpen
            ? `0 0 15px ${getOptionGlowColor(selectedIndex)}`
            : 'none'
        }}
        className="w-full font-intertight bg-black/30 text-gray-100 border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-left flex justify-between items-center"
      >
        <span className="flex items-center gap-2">
          {selectedOption ? (
            <>
              <span>{selectedOption.label}</span>
              <span className={selectedOption.animation}>{selectedOption.emoji}</span>
            </>
          ) : (
            '-- Select --'
          )}
        </span>
        <motion.span 
          className="ml-2 text-white"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ 
              opacity: 0, 
              y: -10, 
              scale: 0.98,
              transition: { 
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            transition={{ 
              duration: 0.35,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="absolute z-50 w-full mt-1 bg-black/60 backdrop-blur-lg border border-emerald-500/30 rounded-md shadow-xl max-h-60 overflow-y-auto origin-top"
          >
            {options.map((option, index) => {
              const factorLabel = getFactorLabel(option.value);
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ 
                    opacity: 0, 
                    x: -5,
                    transition: { duration: 0.15 }
                  }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    onChange({ target: { name, value: option.value } });
                    setIsOpen(false);
                  }}
                  style={{
                    boxShadow: (hoveredIndex === index || value === option.value)
                      ? `0 0 25px ${getOptionGlowColor(index)}, inset 0 0 15px ${getOptionGlowColor(index)}` 
                      : 'none',
                    backgroundColor: (hoveredIndex === index || value === option.value)
                      ? getOptionBgColor(index)
                      : 'transparent'
                  }}
                  className={`w-full px-3 py-2 text-left text-emerald-500 dark:text-gray-100 transition-all duration-300 font-intertight rounded-md
                    ${value === option.value ? 'font-semibold' : ''}
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      <span className={option.animation}>{option.emoji}</span>
                    </div>
                    {factorLabel && (
                      <span className="text-xs opacity-70 font-light tracking-wide ml-auto">
                        {factorLabel}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditFootprintForm = () => {
  useAuthRedirect(); 
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    food: { type: '', amountKg: '' },
    transport: [],
    electricity: [],
    waste: []
  });
  
  const [loading, setLoading] = useState(true);
  const formRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [shakeField, setShakeField] = useState('');
  const [liveEmissions, setLiveEmissions] = useState({
    food: 0,
    transport: 0,
    electricity: 0,
    waste: 0
  });

  // Calculate live emissions
  useEffect(() => {
    const calculateLive = () => {
      const foodFactor = { "Animal based": 6.0, "Plant based": 1.5, "Both": 3.8 }[form.food.type] || 0;
      const foodEmission = (form.food.amountKg || 0) * foodFactor;

      const transportEmission = form.transport.reduce((sum, t) => {
        const factor = { Car: 0.192, Bike: 0.016, Bus: 0.089, Metro: 0.041, Train: 0.049, Flights: 0.254 }[t.mode] || 0;
        return sum + (t.distanceKm || 0) * factor;
      }, 0);

      const electricityEmission = form.electricity.reduce((sum, e) => {
        const factor = { Coal: 0.94, Solar: 0.05, Wind: 0.01, Hydro: 0.02, Mixed: 0.45 }[e.source] || 0;
        return sum + (e.consumptionKwh || 0) * factor;
      }, 0);

      const wasteEmission = form.waste.reduce((sum, w) => {
        return sum + (w.plasticKg || 0) * 5.8 + (w.paperKg || 0) * 1.3 + (w.foodWasteKg || 0) * 2.5;
      }, 0);

      setLiveEmissions({
        food: foodEmission,
        transport: transportEmission,
        electricity: electricityEmission,
        waste: wasteEmission
      });
    };

    calculateLive();
  }, [form]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await API.get(`/footprint/${id}`);
        const entry = res.data;
        setForm({
          food: entry.food || { type: '', amountKg: '' },
          transport: entry.transport || [],
          electricity: entry.electricity || [],
          waste: entry.waste || []
        });
        setLoading(false);
      } catch (err) {
        alert('Failed to load entry');
      }
    };
    fetchEntry();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handleChange = (section, field, value, index = null) => {
    if (index !== null) {
      const updated = [...form[section]];
      updated[index][field] = value;
      setForm({ ...form, [section]: updated });
    } else {
      setForm({ ...form, [section]: { ...form[section], [field]: value } });
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setSaving(true);

  const hasEmpty = 
    !form.food.type || 
    form.food.amountKg === '' ||
    form.transport.some(t => !t.mode || t.distanceKm === '') ||
    form.electricity.some(e => !e.source || e.consumptionKwh === '') ||
    form.waste.some(w => 
      w.plasticKg === '' || w.paperKg === '' || w.foodWasteKg === ''
    );

  const hasNegative =
    Number(form.food.amountKg) < 0 ||
    form.transport.some(t => Number(t.distanceKm) < 0) ||
    form.electricity.some(e => Number(e.consumptionKwh) < 0) ||
    form.waste.some(w => 
      Number(w.plasticKg) < 0 || Number(w.paperKg) < 0 || Number(w.foodWasteKg) < 0
    );

  if (hasEmpty) {
    setError('❓ Please fill in all required fields.');
    setShakeField('form');
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => setShakeField(''), 600);
    setSaving(false);
    return;
  }

  if (hasNegative) {
    setError('🧩 Values cannot be negative.');
    setShakeField('form');
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => setShakeField(''), 600);
    setSaving(false);
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 600));
    await API.put(`/footprint/${id}`, form);

    setSuccess('Changes Saved 🥂');
  
    // Scroll to top smoothly on success
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      navigate('/dashboard', { state: { updated: Date.now() } });
    }, 1200); 
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Update failed';
    setError(`❌ ${errorMsg}`);
    
    // Shake and scroll on error
    setShakeField('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setShakeField(''), 600);
  } finally {
    setSaving(false);
  }
};

  const totalLive = liveEmissions.food + liveEmissions.transport + liveEmissions.electricity + liveEmissions.waste;

  return (
    <motion.div
      initial={{ x:100, opacity: 0}}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full h-full"
    >
      <PageWrapper backgroundImage="/images/edit-bk.webp">
        <div className="flex flex-col justify-center items-center px-4 py-10">
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
                <EditDeleteButton className="w-40" />
                <DashboardButton className="w-40" />
              </div>
            </CardNav>
          </div>

          <div ref={formRef} className={`${boxglowRI} w-full max-w-2xl bg-black/50 backdrop-blur-md rounded-3xl shadow-lg p-6 text-green-500 dark:text-white
            ${shakeField === 'form' ? 'animate-shake' : ''}
          `}>
            
              <h2 className="text-2xl font-semibold mb-6 text-center">
                <AnimatedHeadline />
              </h2>

              {/* Live CO₂ Estimate Card */}
              {totalLive > 0 && (
                <motion.div 
                  className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/30 mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="text-sm font-semibold text-emerald-400 font-intertight tracking-wider text-shadow-DEFAULT mb-3 flex items-center gap-2">
                    <span className="animate-chart-orbit">📊</span>CO₂ Emission
                  </h4>
                  <div className="space-y-2 text-xs">
                    {liveEmissions.food > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-intertight tracking-wide text-shadow-DEFAULT">Food:</span>
                        <span className="font-semibold font-intertight tracking-wide text-shadow-DEFAULT text-emerald-400">{liveEmissions.food.toFixed(1)} kg</span>
                      </div>
                    )}
                    {liveEmissions.transport > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-intertight tracking-wide text-shadow-DEFAULT">Transport:</span>
                        <span className="font-semibold font-intertight tracking-wide text-shadow-DEFAULT text-blue-400">{liveEmissions.transport.toFixed(1)} kg</span>
                      </div>
                    )}
                    {liveEmissions.electricity > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-intertight tracking-wide text-shadow-DEFAULT">Electricity:</span>
                        <span className="font-semibold text-yellow-400 font-intertight tracking-wide text-shadow-DEFAULT">{liveEmissions.electricity.toFixed(1)} kg</span>
                      </div>
                    )}
                    {liveEmissions.waste > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-intertight tracking-wide text-shadow-DEFAULT">Waste:</span>
                        <span className="font-semibold font-intertight tracking-wide text-shadow-DEFAULT text-red-400">{liveEmissions.waste.toFixed(1)} kg</span>
                      </div>
                    )}
                    <div className="border-t border-white/20 pt-2 mt-2 flex justify-between">
                      <span className="text-white text-lg font-bold font-intertight tracking-wider text-shadow-DEFAULT">Total:</span>
                      <span className="font-bold font-intertight tracking-wide text-shadow-DEFAULT text-white text-lg">
                        {totalLive.toFixed(1)} kg CO₂
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {success && <p className="text-green-500 text-sm text-center animate-pulse font-intertight tracking-wider text-shadow-DEFAULT mb-3">{success}</p>}
              {error && <p className="text-red-500 text-sm text-center animate-bounce font-intertight tracking-wider text-shadow-DEFAULT mb-3">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* FOOD SECTION */}
                <div>
                  <h3 className="font-intertight tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-gray-100 mb-1">
                    Diet <span className="animate-diet-symbol">𓌉◯𓇋</span>
                  </h3>
                  <label className="block mb-1 text-sm font-intertight text-emerald-500 dark:text-gray-100 tracking-wider text-shadow-DEFAULT">Type:</label>
                  <CustomSelect
                    name="type"
                    value={form.food?.type || ''}
                    onChange={(e) => setForm({ ...form, food: { ...form.food, type: e.target.value } })}
                    options={[
                      { value: 'Animal based', label: 'Animal based', emoji: '🍖', animation: 'animate-meat-sizzle' },
                      { value: 'Plant based', label: 'Plant based', emoji: '🪴', animation: 'animate-plant-grow' },
                      { value: 'Both', label: 'Mixed', emoji: '🍔', animation: 'animate-burger-stack' }
                    ]}
                  />

                  <label className="block mt-2 mb-1 text-sm font-intertight tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">Amount (kg):</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Amount (kg)"
                      value={form.food.amountKg}
                      onChange={(e) => handleChange('food', 'amountKg', e.target.value)}
                      className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 text-emerald-600 dark:text-gray-100 pr-24"
                    />
                    {form.food.amountKg && form.food.type && (
                      <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                        ≈ {liveEmissions.food.toFixed(1)} kg CO₂
                      </span>
                    )}
                  </div>
                </div>

                {/* Transport Section */}
                <div>
                  <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">
                    Transport <span className="animate-transport-ufo">🛸</span>
                  </label>
                  {form.transport.map((t, i) => (
                    <div key={i} className="space-y-2 mb-2">
                      <CustomSelect
                        name="mode"
                        value={t.mode}
                        onChange={(e) => handleChange('transport', 'mode', e.target.value, i)}
                        options={[
                          { value: 'Car', label: 'Car', emoji: '🏎️', animation: 'animate-race-car' },
                          { value: 'Bike', label: 'Bike', emoji: '🏍️', animation: 'animate-motorcycle' },
                          { value: 'Bus', label: 'Bus', emoji: '🚐', animation: 'animate-bus-ride' },
                          { value: 'Metro', label: 'Metro', emoji: '🚊', animation: 'animate-metro-slide' },
                          { value: 'Train', label: 'Train', emoji: '🚂', animation: 'animate-train-chug' },
                          { value: 'Flights', label: 'Flights', emoji: '✈️', animation: 'animate-airplane-soar' }
                        ]}
                      />
                      <label className="block mt-2 mb-1 text-sm font-intertight tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">Distance (km):</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Distance (km)"
                          value={t.distanceKm}
                          onChange={(e) => handleChange('transport', 'distanceKm', e.target.value, i)}
                          className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 text-emerald-500 dark:text-gray-100 pr-28"
                        />
                        {t.mode && t.distanceKm && (
                          <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                            ≈ {(t.distanceKm * ({ Car: 0.192, Bike: 0.016, Bus: 0.089, Metro: 0.041, Train: 0.049, Flights: 0.254 }[t.mode] || 0)).toFixed(1)} kg CO₂
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Electricity Section */}
                <div>
                  <label className="blockmb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">
                    Electricity <span className="animate-electric-bolt">⚡</span>
                  </label>
                  {form.electricity.map((el, i) => (
                    <div key={i} className="space-y-2 mb-2">
                      <CustomSelect
                        name="source"
                        value={el.source}
                        onChange={(e) => handleChange('electricity', 'source', e.target.value, i)}
                        options={[
                          { value: 'Coal', label: 'Coal', emoji: '🔥', animation: 'animate-coal-fire' },
                          { value: 'Solar', label: 'Solar', emoji: '☀️', animation: 'animate-solar-radiate' },
                          { value: 'Wind', label: 'Wind', emoji: '༄', animation: 'animate-wind-flow' },
                          { value: 'Hydro', label: 'Hydro', emoji: '🌊', animation: 'animate-hydro-wave' },
                          { value: 'Mixed', label: 'Mixed', emoji: '𓇼', animation: 'animate-mixed-shimmer' }
                        ]}
                      />
                      <label className="block mt-2 mb-1 text-sm font-intertight tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">Consumption (kWh):</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Consumption (kWh)"
                          value={el.consumptionKwh}
                          onChange={(e) => handleChange('electricity', 'consumptionKwh', e.target.value, i)}
                          className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 text-emerald-500 dark:text-gray-100 pr-28"
                        />
                        {el.source && el.consumptionKwh && (
                          <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                            ≈ {(el.consumptionKwh * ({ Coal: 0.94, Solar: 0.05, Wind: 0.01, Hydro: 0.02, Mixed: 0.45 }[el.source] || 0)).toFixed(1)} kg CO₂
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* WASTE */}
                <div>
                  <h3 className="font-semibold mb-2 text-emerald-500 dark:text-gray-100">
                    Waste <span className="animate-waste-dispose">🗑️</span>
                  </h3>
                  {form.waste.map((w, i) => (
                    <div key={i} className="mb-2 space-y-2">
                      <label className="block text-sm font-intertight tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">Plastic (kg):</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Plastic (kg)"
                          value={w.plasticKg}
                          onChange={(e) => handleChange('waste', 'plasticKg', e.target.value, i)}
                          className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 text-emerald-600 dark:text-gray-100 pr-24"
                        />
                        {w.plasticKg && (
                          <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                            ≈ {(w.plasticKg * 5.8).toFixed(1)} kg CO₂
                          </span>
                        )}
                      </div>

                      <label className="block text-sm font-intertight tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">Paper (kg):</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Paper (kg)"
                          value={w.paperKg}
                          onChange={(e) => handleChange('waste', 'paperKg', e.target.value, i)}
                          className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 text-emerald-600 dark:text-gray-100 pr-24"
                        />
                        {w.paperKg && (
                          <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                            ≈ {(w.paperKg * 1.3).toFixed(1)} kg CO₂
                          </span>
                        )}
                      </div>

                      <label className="block text-sm font-intertight tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">Food (kg):</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Food Waste (kg)"
                          value={w.foodWasteKg}
                          onChange={(e) => handleChange('waste', 'foodWasteKg', e.target.value, i)}
                          className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 text-emerald-600 dark:text-gray-100 pr-24"
                        />
                        {w.foodWasteKg && (
                          <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                            ≈ {(w.foodWasteKg * 2.5).toFixed(1)} kg CO₂
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* SUBMIT */}
                <SaveChangesButton
                  text={success ? 'Saved' : saving ? 'Saving...' : 'Save Changes'}
                  disabled={saving}
                  type="submit"
                  styleOverride={{ width: '100%', height: '3.5rem' }}
                />
              </form>
            
          </div>
        </div>
      </PageWrapper>
    </motion.div>
  );
};

export default EditFootprintForm;