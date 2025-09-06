import API from 'api/api';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import useAuthRedirect from 'hooks/useAuthRedirect';
import { SaveChangesButton } from 'Components/globalbuttons';
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
  const [error, setError] = useState('');
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const topRef = useRef(null);
    
    const bottomRef = useRef(null);
  

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
    setSaving(false);
    return;
  }

  if (hasNegative) {
    setError('🧩 Values cannot be negative.');
    setSaving(false);
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 600));
    await API.put(`/footprint/${id}`, form);

    setSuccess('Changes Saved 🥂');
  
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100); 

    setTimeout(() => {
      navigate('/dashboard', { state: { updated: Date.now() } });
    }, 1200); 
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Update failed';
    setError(`❌ ${errorMsg}`);
  } finally {
    setSaving(false);
  }
};

useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}, []);

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
        <div className="w-full max-w-2xl bg-white/10 dark:bg-black/50 backdrop-blur-md rounded-3xl shadow-lg p-6 text-green-500 dark:text-white">
          <h2 className="text-2xl font-semibold mb-6 text-center"><AnimatedHeadline /></h2>
          {success && <p className="text-green-500 text-sm text-center animate-pulse font-intertight tracking-wider text-shadow-DEFAULT mb-3">{success}</p>}
          {error && <p className="text-red-500 text-sm text-center animate-bounce font-intertight tracking-wider text-shadow-DEFAULT mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* FOOD SECTION */}
            <div>
              <h3 className="font-intertight tracking-wider text-shadow-DEFAULT mb-1 ">Diet <span className="animate-pulse">𓌉◯𓇋</span></h3>
              <label className="block mb-1 text-sm font-intertight tracking-wider text-shadow-DEFAULT">Type:</label>
              <select
  name="type"
  value={form.food?.type || ''}
  onChange={(e) => setForm({ ...form, food: { ...form.food, type: e.target.value } })}
  className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-white/10 dark:bg-black/30 text-emerald-600 dark:text-gray-100 
             border border-emerald-400 focus:outline-none py-2 px-3 rounded-md 
             backdrop-blur-sm transition duration-300 appearance-none 
             focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
>
  <option value="">-- Select --</option>
  <option value="Animal based">Animal based 🍖</option>
  <option value="Plant based">Plant based 🪴</option>
  <option value="Both">Mixed 🍔</option>
</select>

              <label className="block mt-2 mb-1 text-sm font-intertight tracking-wider text-shadow-DEFAULT">Amount (kg):</label>
               <input
      type="number"
      placeholder="Amount (kg)"
      value={form.food.amountKg}
      onChange={(e) => handleChange('food', 'amountKg', e.target.value)}
      className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                 text-emerald-600 dark:text-gray-100"
    />
            </div>

           {/* Transport Section */}
<div>
  <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">Transport <span className="animate-pulse">🛸</span></label>
  {form.transport.map((t, i) => (
    <div key={i} className="space-y-2 mb-2 ">
      <select
        name="mode"
        value={t.mode}
        onChange={(e) => handleChange('transport', 'mode', e.target.value, i)}
        className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-white/10 dark:bg-black/30 text-emerald-500 dark:text-gray-100 
                   border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md 
                   backdrop-blur-sm transition duration-300 appearance-none 
                   focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
      >
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
        placeholder="Distance (km)"
        value={t.distanceKm}
        onChange={(e) => handleChange('transport', 'distanceKm', e.target.value, i)}
        className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-500 dark:text-gray-100"
      />
    </div>
  ))}
</div>


            {/* Electricity Section */}
<div>
  <label className="block mb-1 text-emerald-500 dark:text-gray-100 font-intertight tracking-wider text-shadow-DEFAULT">Electricity <span className="animate-pulse">⚡</span></label>
  {form.electricity.map((el, i) => (
    <div key={i} className="space-y-2 mb-2">
      <select
        name="source"
        value={el.source}
        onChange={(e) => handleChange('electricity', 'source', e.target.value, i)}
        className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-white/10 dark:bg-black/30 text-emerald-500 dark:text-gray-100 
                   border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md 
                   backdrop-blur-sm transition duration-300 appearance-none 
                   focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
      >
        <option value="">-- Source --</option>
        <option value="Coal">Coal 🔥</option>
        <option value="Solar">Solar ☀️</option>
        <option value="Wind">Wind ༄</option>
        <option value="Hydro">Hydro 🌊</option>
        <option value="Mixed">Mixed 𓇼</option>
      </select>
      <input
        type="number"
        placeholder="Consumption (kWh)"
        value={el.consumptionKwh}
        onChange={(e) => handleChange('electricity', 'consumptionKwh', e.target.value, i)}
        className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-500 dark:text-gray-100"
      />
    </div>
  ))}
</div>


            {/* WASTE */}
            <div>
              <h3 className="font-semibold mb-2">Waste <span className="animate-pulse">🗑️</span></h3>
              {form.waste.map((w, i) => (
                <div key={i} className="mb-2">
                  <label className="block text-sm font-intertight tracking-wider text-shadow-DEFAULT">Plastic (kg):</label>
                  <input
        type="number"
        placeholder="Plastic (kg)"
        value={w.plasticKg}
        onChange={(e) => handleChange('waste', 'plasticKg', e.target.value, i)}
        className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-600 dark:text-gray-100"
      /><label className="block text-sm font-intertight tracking-wider text-shadow-DEFAULT">Paper (kg):</label>
      <input
        type="number"
        placeholder="Paper (kg)"
        value={w.paperKg}
        onChange={(e) => handleChange('waste', 'paperKg', e.target.value, i)}
        className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-600 dark:text-gray-100"
      /><label className="block text-sm font-intertight tracking-wider text-shadow-DEFAULT">Food (kg):</label>
      <input
        type="number"
        placeholder="Food Waste (kg)"
        value={w.foodWasteKg}
        onChange={(e) => handleChange('waste', 'foodWasteKg', e.target.value, i)}
        className="w-full font-intertight tracking-wider text-shadow-DEFAULT bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-600 dark:text-gray-100"
      />
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
