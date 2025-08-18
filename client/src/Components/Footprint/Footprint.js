import API from 'api/api';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import useAuthRedirect from 'hooks/useAuthRedirect';
import { buttonColorConfigs, SubmitButton } from 'Components/globalbuttons';

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
const Footprint = () => {
  useAuthRedirect(); 
  const [formData, setFormData] = useState({
    food: { type: '', amountKg: '' },
    transport: [{mode: '', distanceKm: ''}],
    electricity: [{source: '', consumptionKwh: ''}],
    waste: [{ plasticKg: '', paperKg: '', foodWasteKg: '' }]
  });

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

  const addTransport = () => {
    setFormData({
      ...formData,
      transport: [...formData.transport, { mode: '', distanceKm: '' }]
    });
  };

  const handleRemoveTransport = (index) => {
  const updated = [...formData.transport];
  updated.splice(index, 1);
  setFormData({ ...formData, transport: updated });
  };

  const handleRemoveElectricity = (index) => {
  const updated = [...formData.electricity];
  updated.splice(index, 1);
  setFormData({ ...formData, electricity: updated });
};


  const handleElectricityChange = (index, e) => {
    const updated = [...formData.electricity];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, electricity: updated });
  };

  const addElectricity = () => {
    setFormData({
      ...formData,
      electricity: [...formData.electricity, { source: '', consumptionKwh: '' }]
    });
  };

  const handleWasteChange = (e) => {
    setFormData({
      ...formData,
      waste: [{ ...formData.waste[0], [e.target.name]: e.target.value }]
    });
  };
 // 
const [error, setError] = useState('');
useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timer);
  }
}, [error]);

const [success, setSuccess] = useState('');
const [loading, setLoading] = useState(false);
const topRef = useRef(null);
const bottomRef = useRef(null);
const navigate = useNavigate(); 

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
    setLoading(false);
    return;
  }

  if (hasNegative) {
    setError('🧩 Values cannot be negative.');
    setLoading(false);
    return;
  }
  try {
    const res = await API.post('/footprint', formData);

    setSuccess('Entry Submitted Successfully!🥂');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100); 

    setTimeout(() => {
      navigate('/dashboard', { state: { updated: Date.now() } });
    }, 1100); 

  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Something went wrong';
    console.error('❌ Submission Error:', err);
    setError(`❌ ${errorMsg}`);
  } finally {
    setLoading(false);
  }
};

// useEffect(() => {
//   window.scrollTo({ top: 0, left: 0, behavior: "auto" });
//   document.documentElement.scrollTop = 0;
//   document.body.scrollTop = 0;
// }, []);


// ui
  return (
    <motion.div
                    initial={{ x:100, opacity: 0}}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="w-full h-full"
                  >
    <PageWrapper backgroundImage="/images/foot-bk.webp">
      <div className="flex flex-col items-center justify-center w-full px-6 py-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl mt-6 p-6 bg-white/10 dark:bg-black/50 backdrop-blur-lg rounded-xl text-white space-y-6 shadow-xl transition-all duration-500"
        >
          <h2 className="text-3xl font-bold text-center text-emerald-500 dark:text-gray-100"><AnimatedHeadline /></h2>
            <h3 className="sm:text-xl sm:tracking-wide text-base font-intertight text-center text-shadow-DEFAULT text-emerald-500 dark:text-gray-100">Enter your estimated data for a month <span className="animate-pulse">🌍</span></h3>
            {success && <p className="text-green-500 text-base text-shadow-DEFAULT font-intertight font-medium text-center animate-pulse">{success}</p>}
            {error && <p className="text-red-500 text-shadow-DEFAULT font-intertight font-medium text-base text-center animate-bounce">{error}</p>}

          {/* food */}
          <div>
            <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">Diet Type <span className="animate-pulse">𓌉◯𓇋</span></label>
            <select
              name="type"
              value={formData.food.type}
              onChange={handleFoodChange}
              className="w-full bg-white/10 font-intertight dark:bg-black/30 text-emerald-500 dark:text-gray-100 border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md backdrop-blur-sm transition duration-300
             appearance-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
              <option value="">-- Select --</option>
              <option value="Animal based">Animal based 🍖</option>
              <option value="Plant based">Plant based 🪴</option>
              <option value="Both">Mixed 🍔</option>
            </select>
            <input
              type="number"
              name="amountKg"
              placeholder="Amount (kg)"
              value={formData.food.amountKg}
              onChange={handleFoodChange}
              className="w-full bg-transparent border-b font-intertight tracking-wider text-shadow-DEFAULT border-emerald-500 focus:outline-none py-1 mt-2"
            />
          </div>

          {/* transport */}
          <div>
            <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">Transport <span className="animate-pulse">🛸</span></label>
            {formData.transport.map((t, i) => (
              <div key={i} className="space-y-2 mb-2 relative">
                <select
                  name="mode"
                  value={t.mode}
                  onChange={(e) => handleTransportChange(i, e)}
                  className="w-full font-intertight bg-white/10 dark:bg-black/30 text-emerald-500 dark:text-gray-100 border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md backdrop-blur-sm transition duration-300
             appearance-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
                  <option value="">-- Mode --</option>
                  <option value="Car">Car 🏎️</option>
                  <option value="Bike">Bike 🏍️</option>
                  <option value="Bus">Bus 🚐</option>
                  <option value="Metro">Metro 🚊</option>
                  <option value="Train">Train 🚂</option>
                  <option value="Flights">Flights ✈️</option>
                </select>
                <input
                  type="number"
                  name="distanceKm"
                  placeholder="Distance (km)"
                  value={t.distanceKm}
                  onChange={(e) => handleTransportChange(i, e)}
                  className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1"
                />
                 {formData.transport.length > 1 && (
      <button
        type="button"
        onClick={() => handleRemoveTransport(i)}
        className="absolute top-0 right-0 text-red-400 text-xs hover:text-red-600 font-intertight tracking-wider text-shadow-DEFAULT"
      >
        Remove <span className="animate-pulse">❌</span>
      </button>
    )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTransport}
              className="text-emerald-500 dark:text-gray-100 hover:text-emerald-200 transition font-intertight tracking-wider text-shadow-DEFAULT"
            >
              Add <span className="animate-pulse">+</span>
            </button>
          </div>

          {/* electricity */}
          <div>
            <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">Electricity <span className="animate-pulse">⚡</span></label>
            {formData.electricity.map((el, i) => (
              <div key={i} className="space-y-2 mb-2 relative">
                <select
                  name="source"
                  value={el.source}
                  onChange={(e) => handleElectricityChange(i, e)}
                  className="w-full bg-white/10 font-intertight dark:bg-black/30 text-emerald-500 dark:text-gray-100 border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md backdrop-blur-sm transition duration-300
             appearance-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
                  <option value="">-- Source --</option>
                  <option value="Coal">Coal 🔥</option>
                  <option value="Solar">Solar ☀️</option>
                  <option value="Wind">Wind ༄</option>
                  <option value="Hydro">Hydro 🌊</option>
                  <option value="Mixed">Mixed 𓇼</option>
                </select>
                <input
                  type="number"
                  name="consumptionKwh"
                  placeholder="Consumption (kWh)"
                  value={el.consumptionKwh}
                  onChange={(e) => handleElectricityChange(i, e)}
                  className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1"
                />
                {formData.electricity.length > 1 && (
      <button
        type="button"
        onClick={() => handleRemoveElectricity(i)}
        className="absolute top-0 right-0 text-red-400 text-xs hover:text-red-600 font-intertight tracking-wider text-shadow-DEFAULT"
      >
        Remove <span className="animate-pulse">❌</span>
      </button>
    )}
              </div>
            ))}
            <button
              type="button"
              onClick={addElectricity}
              className="text-emerald-500 dark:text-gray-100 hover:text-emerald-200 transition font-intertight tracking-wider text-shadow-DEFAULT"
            >
              Add <span className="animate-pulse">+</span>
            </button>
          </div>

          {/* waste */}
          <div>
            <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">Waste <span className="animate-pulse">🗑️</span></label>
            <input
              type="number"
              name="plasticKg"
              placeholder="Plastic (kg)"
              value={formData.waste[0].plasticKg}
              onChange={handleWasteChange}
              className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 mb-2"
            />
            <input
              type="number"
              name="paperKg"
              placeholder="Paper (kg)"
              value={formData.waste[0].paperKg}
              onChange={handleWasteChange}
              className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 mb-2"
            />
            <input
              type="number"
              name="foodWasteKg"
              placeholder="Food (kg)"
              value={formData.waste[0].foodWasteKg}
              onChange={handleWasteChange}
              className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1"
            />
          </div>
<SubmitButton text="Submit" loading={loading} success={success} disabled={loading} customColorConfig={buttonColorConfigs.footsave}/>
        </form>
      </div>
    </PageWrapper>
    </motion.div>
  );
};

export default Footprint;
