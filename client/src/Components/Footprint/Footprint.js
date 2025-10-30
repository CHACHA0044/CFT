import API from 'api/api';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import useAuthRedirect from 'hooks/useAuthRedirect';
import { buttonColorConfigs, SubmitButton } from 'Components/globalbuttons';
import { EditDeleteButton, DashboardButton } from 'Components/globalbuttons';
import { boxglowF } from 'utils/styles';
import CardNav from 'Components/CardNav';  
import LottieLogo from 'Components/LottieLogoComponent';

const sentence = "Footprint Entry";
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
        className="w-full bg-white/10 font-intertight dark:bg-black/30 text-emerald-500 dark:text-gray-100 border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-left flex justify-between items-center"
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
            className="absolute z-50 w-full mt-1 bg-white/20 dark:bg-black/60 backdrop-blur-lg border border-emerald-500/30 rounded-md shadow-xl max-h-60 overflow-y-auto origin-top"
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

const Footprint = () => {
  useAuthRedirect(); 
  const [formData, setFormData] = useState({
    food: { type: '', amountKg: '' },
    transport: [{mode: '', distanceKm: ''}],
    electricity: [{source: '', consumptionKwh: ''}],
    waste: [{ plasticKg: '', paperKg: '', foodWasteKg: '' }]
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shakeField, setShakeField] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [liveEmissions, setLiveEmissions] = useState({
    food: 0,
    transport: 0,
    electricity: 0,
    waste: 0
  });

  const navigate = useNavigate();

  // Calculate completion percentage
  useEffect(() => {
    const fields = [
      formData.food.type,
      formData.food.amountKg,
      formData.transport[0]?.mode,
      formData.transport[0]?.distanceKm,
      formData.electricity[0]?.source,
      formData.electricity[0]?.consumptionKwh,
      formData.waste[0]?.plasticKg,
      formData.waste[0]?.paperKg,
      formData.waste[0]?.foodWasteKg
    ];
    const filled = fields.filter(f => f !== '' && f !== undefined).length;
    setCompletionPercentage(Math.round((filled / fields.length) * 100));
  }, [formData]);

  // Calculate live emissions
  useEffect(() => {
    const calculateLive = () => {
      const foodFactor = { "Animal based": 6.0, "Plant based": 1.5, "Both": 3.8 }[formData.food.type] || 0;
      const foodEmission = (formData.food.amountKg || 0) * foodFactor;

      const transportEmission = formData.transport.reduce((sum, t) => {
        const factor = { Car: 0.192, Bike: 0.016, Bus: 0.089, Metro: 0.041, Train: 0.049, Flights: 0.254 }[t.mode] || 0;
        return sum + (t.distanceKm || 0) * factor;
      }, 0);

      const electricityEmission = formData.electricity.reduce((sum, e) => {
        const factor = { Coal: 0.94, Solar: 0.05, Wind: 0.01, Hydro: 0.02, Mixed: 0.45 }[e.source] || 0;
        return sum + (e.consumptionKwh || 0) * factor;
      }, 0);

      const wasteEmission = formData.waste.reduce((sum, w) => {
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
  }, [formData]);

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

  const handleFoodChange = (e) => {
    setFormData({
      ...formData,
      food: { ...formData.food, [e.target.name]: e.target.value }
    });
  };

  const handleTransportChange = (index, e) => {
    const updated = [...formData.transport];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, transport: updated });
  };

  const MAX_TRANSPORT = 6;
  const addTransport = () => {
    const currentCount = formData.transport.length;

    if (currentCount >= MAX_TRANSPORT) {
      setSuccess(`🚦 You can only add up to ${MAX_TRANSPORT} transport entries...`);
      return;
    }

    const updatedTransport = [
      ...formData.transport,
      { mode: '', distanceKm: '' }
    ];

    setFormData({ ...formData, transport: updatedTransport });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (updatedTransport.length === MAX_TRANSPORT) {
      setSuccess(`🚦 You've reached the maximum of ${MAX_TRANSPORT} transport entries...`);
    } else {
      setSuccess('✅ New transport option added!');
    }
  };

  const handleRemoveTransport = (index) => {
    const updated = [...formData.transport];
    updated.splice(index, 1);
    setFormData({ ...formData, transport: updated });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSuccess('🚗 Transport option removed.');
  };

  const handleElectricityChange = (index, e) => {
    const updated = [...formData.electricity];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, electricity: updated });
  };

  const MAX_ELECTRICITY = 4;
  const addElectricity = () => {
    const currentCount = formData.electricity.length;

    if (currentCount >= MAX_ELECTRICITY) {
      setSuccess(`⚡ You can only add up to ${MAX_ELECTRICITY} electricity entries...`);
      return;
    }

    const updatedElectricity = [
      ...formData.electricity,
      { source: '', consumptionKwh: '' }
    ];

    setFormData({ ...formData, electricity: updatedElectricity });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (updatedElectricity.length === MAX_ELECTRICITY) {
      setSuccess(`⚡ You've reached the maximum of ${MAX_ELECTRICITY} electricity entries...`);
    } else {
      setSuccess('✅ New electricity option added!');
    }
  };

  const handleRemoveElectricity = (index) => {
    const updated = [...formData.electricity];
    updated.splice(index, 1);
    setFormData({ ...formData, electricity: updated });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSuccess('⚡ Electricity option removed.');
  };

  const handleWasteChange = (e) => {
    setFormData({
      ...formData,
      waste: [{ ...formData.waste[0], [e.target.name]: e.target.value }]
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);
  await new Promise((resolve) => setTimeout(resolve, 600));

  const hasEmpty = 
    !formData.food.type || 
    formData.food.amountKg === '' ||
    formData.transport.some(t => !t.mode || t.distanceKm === '') ||
    formData.electricity.some(e => !e.source || e.consumptionKwh === '') ||
    formData.waste.some(w => 
      w.plasticKg === '' || w.paperKg === '' || w.foodWasteKg === ''
    );

  const hasNegative =
    Number(formData.food.amountKg) < 0 ||
    formData.transport.some(t => Number(t.distanceKm) < 0) ||
    formData.electricity.some(e => Number(e.consumptionKwh) < 0) ||
    formData.waste.some(w => 
      Number(w.plasticKg) < 0 || Number(w.paperKg) < 0 || Number(w.foodWasteKg) < 0
    );

  if (hasEmpty) {
    setError('❓ Please fill in all required fields.');
    setShakeField('form');
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Alternative: Scroll to form itself
    // formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => setShakeField(''), 600);
    setLoading(false);
    return;
  }

  if (hasNegative) {
    setError('🧩 Values cannot be negative.');
    setShakeField('form');
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => setShakeField(''), 600);
    setLoading(false);
    return;
  }

  try {
    const res = await API.post('/footprint', formData);

    setSuccess('Entry Submitted Successfully!🥂');
    
    // Scroll to top on success
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      navigate('/dashboard', { state: { updated: Date.now() } });
    }, 1100); 

  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Something went wrong';
    console.error('❌ Submission Error:', err);
    setError(`❌ ${errorMsg}`);
    
    // Shake and scroll on error
    setShakeField('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setShakeField(''), 600);
  } finally {
    setLoading(false);
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
      <PageWrapper backgroundImage="/images/foot-bk.webp">
        <div className="w-auto px-0">
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
              <EditDeleteButton className="w-40" />
              <DashboardButton className="w-40" />
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
          <div className="flex flex-col items-center justify-center w-full px-6 py-6">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className={`${boxglowF} w-full max-w-xl mt-6 p-6 bg-white/10 dark:bg-black/50 backdrop-blur-lg rounded-3xl text-white space-y-6 shadow-xl transition-all duration-500
                ${shakeField === 'form' ? 'animate-shake' : ''}
              `}
            >
              <h2 className="text-3xl font-bold text-center text-emerald-500 dark:text-gray-100">
                <AnimatedHeadline />
              </h2>
              
              <h3 className="sm:text-xl sm:tracking-wide text-base font-intertight text-center text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">
                Enter your estimated data for a month <span className="animate-earth-spin"><span>🌎</span></span>
              </h3>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-intertight tracking-wide text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">
                  Progress
                  </span>
                  <span className="text-sm font-semibold font-intertight tracking-wide text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

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

              {success && <p className="text-green-500 text-base text-shadow-DEFAULT font-intertight font-medium text-center animate-pulse">{success}</p>}
              {error && <p className="text-red-500 text-shadow-DEFAULT font-intertight font-medium text-base text-center animate-bounce">{error}</p>}

              {/* Food Section */}
              <div>
                <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">
                  Diet Type <span className="animate-diet-symbol">𓌉◯𓇋</span>
                </label>
                <CustomSelect
                  name="type"
                  value={formData.food.type}
                  onChange={handleFoodChange}
                  options={[
                    { value: 'Animal based', label: 'Animal based', emoji: '🍖', animation: 'animate-meat-sizzle' },
                    { value: 'Plant based', label: 'Plant based', emoji: '🪴', animation: 'animate-plant-grow' },
                    { value: 'Both', label: 'Mixed', emoji: '🍔', animation: 'animate-burger-stack' }
                  ]}
                />
                <div className="relative">
                  <input
                    type="number"
                    name="amountKg"
                    placeholder="Amount (kg)"
                    value={formData.food.amountKg}
                    onChange={handleFoodChange}
                    className="w-full bg-transparent border-b font-intertight tracking-wider text-shadow-DEFAULT border-emerald-500 focus:outline-none py-1 mt-2 pr-24"
                  />
                  <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                    {formData.food.amountKg && formData.food.type ? 
                      `≈ ${liveEmissions.food.toFixed(1)} kg CO₂` : 
                      ''}
                  </span>
                </div>
              </div>

              {/* Transport Section */}
              <div>
                <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">
                  Transport <span className="animate-transport-ufo">🛸</span>
                </label>
                {formData.transport.map((t, i) => (
                  <div key={i} className="space-y-2 mb-2 relative">
                    <CustomSelect
                      name="mode"
                      value={t.mode}
                      onChange={(e) => handleTransportChange(i, e)}
                      options={[
                        { value: 'Car', label: 'Car', emoji: '🏎️', animation: 'animate-race-car' },
                        { value: 'Bike', label: 'Bike', emoji: '🏍️', animation: 'animate-motorcycle' },
                        { value: 'Bus', label: 'Bus', emoji: '🚐', animation: 'animate-bus-ride' },
                        { value: 'Metro', label: 'Metro', emoji: '🚊', animation: 'animate-metro-slide' },
                        { value: 'Train', label: 'Train', emoji: '🚂', animation: 'animate-train-chug' },
                        { value: 'Flights', label: 'Flights', emoji: '✈️', animation: 'animate-airplane-soar' }
                      ]}
                    />
                    <div className="relative">
                      <input
                        type="number"
                        name="distanceKm"
                        placeholder="Distance (km)"
                        value={t.distanceKm}
                        onChange={(e) => handleTransportChange(i, e)}
                        className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 pr-28"
                      />
                      {t.mode && t.distanceKm && (
                        <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                          ≈ {(t.distanceKm * ({ Car: 0.192, Bike: 0.016, Bus: 0.089, Metro: 0.041, Train: 0.049, Flights: 0.254 }[t.mode] || 0)).toFixed(1)} kg CO₂
                        </span>
                      )}
                    </div>
                    {formData.transport.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTransport(i)}
                        className="absolute top-0 right-0 text-red-400 text-xs hover:text-red-600 font-intertight tracking-wider text-shadow-DEFAULT"
                      >
                        Remove <span className="animate-remove-cross">❌</span>
                      </button>
                    )}
                  </div>
                ))}
                {formData.transport.length < MAX_TRANSPORT && (
                  <button
                    type="button"
                    onClick={addTransport}
                    className="text-emerald-500 dark:text-gray-100 hover:text-emerald-200 transition font-intertight tracking-wider text-shadow-DEFAULT"
                  >
                    Add <span className="animate-add-plus">+</span>
                  </button>
                )}
              </div>

              {/* Electricity Section */}
              <div>
                <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">
                  Electricity <span className="animate-electric-bolt">⚡</span>
                </label>
                {formData.electricity.map((el, i) => (
                  <div key={i} className="space-y-2 mb-2 relative">
                    <CustomSelect
                      name="source"
                      value={el.source}
                      onChange={(e) => handleElectricityChange(i, e)}
                      options={[
                        { value: 'Coal', label: 'Coal', emoji: '🔥', animation: 'animate-coal-fire' },
                        { value: 'Solar', label: 'Solar', emoji: '☀️', animation: 'animate-solar-radiate' },
                        { value: 'Wind', label: 'Wind', emoji: '༄', animation: 'animate-wind-flow' },
                        { value: 'Hydro', label: 'Hydro', emoji: '🌊', animation: 'animate-hydro-wave' },
                        { value: 'Mixed', label: 'Mixed', emoji: '𓇼', animation: 'animate-mixed-shimmer' }
                      ]}
                    />
                    <div className="relative">
                      <input
                        type="number"
                        name="consumptionKwh"
                        placeholder="Consumption (kWh)"
                        value={el.consumptionKwh}
                        onChange={(e) => handleElectricityChange(i, e)}
                        className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 pr-28"
                      />
                      {el.source && el.consumptionKwh && (
                        <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                          ≈ {(el.consumptionKwh * ({ Coal: 0.94, Solar: 0.05, Wind: 0.01, Hydro: 0.02, Mixed: 0.45 }[el.source] || 0)).toFixed(1)} kg CO₂
                        </span>
                      )}
                    </div>
                    {formData.electricity.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveElectricity(i)}
                        className="absolute top-0 right-0 text-red-400 text-xs hover:text-red-600 font-intertight tracking-wider text-shadow-DEFAULT"
                      >
                        Remove <span className="animate-remove-cross">❌</span>
                      </button>
                    )}
                  </div>
                ))}
                {formData.electricity.length < MAX_ELECTRICITY && (
                  <button
                    type="button"
                    onClick={addElectricity}
                    className="text-emerald-500 dark:text-gray-100 hover:text-emerald-200 transition font-intertight tracking-wider text-shadow-DEFAULT"
                  >
                    Add <span className="animate-add-plus">+</span>
                  </button>
                )}
              </div>

              {/* Waste Section */}
              <div>
                <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">
                  Waste <span className="animate-waste-dispose">🗑️</span>
                </label>
                <div className="relative mb-2">
                  <input
                    type="number"
                    name="plasticKg"
                    placeholder="Plastic (kg)"
                    value={formData.waste[0].plasticKg}
                    onChange={handleWasteChange}
                    className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 pr-24"
                  />
                  {formData.waste[0].plasticKg && (
                    <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                      ≈ {(formData.waste[0].plasticKg * 5.8).toFixed(1)} kg CO₂
                    </span>
                  )}
                </div>
                <div className="relative mb-2">
                  <input
                    type="number"
                    name="paperKg"
                    placeholder="Paper (kg)"
                    value={formData.waste[0].paperKg}
                    onChange={handleWasteChange}
                    className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 pr-24"
                  />
                  {formData.waste[0].paperKg && (
                    <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                      ≈ {(formData.waste[0].paperKg * 1.3).toFixed(1)} kg CO₂
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="foodWasteKg"
                    placeholder="Food (kg)"
                    value={formData.waste[0].foodWasteKg}
                    onChange={handleWasteChange}
                    className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 pr-24"
                  />
                  {formData.waste[0].foodWasteKg && (
                    <span className="absolute right-0 bottom-1 text-xs text-gray-400">
                      ≈ {(formData.waste[0].foodWasteKg * 2.5).toFixed(1)} kg CO₂
                    </span>
                  )}
                </div>
              </div>

              <SubmitButton 
                text="Submit" 
                loading={loading} 
                success={success} 
                disabled={loading} 
                customColorConfig={buttonColorConfigs.footsave}
              />
            </form>
          </div>
        </motion.div>
      </PageWrapper>
    </motion.div>
  );
};

export default Footprint;