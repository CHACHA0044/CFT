import API from 'api/api';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import zxcvbn from 'zxcvbn';
import PageWrapper from 'common/PageWrapper';
import { SubmitButton } from 'Components/globalbuttons';
import {
  inputBase,
  inputDark,
  buttonBase,
  buttonGreen,
  heading,
  subheading,
  inputMail,
  inputPass,
  boxglow
} from 'utils/styles';

  const sentence = "Track. Reduce. Inspire.";
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
      <div className="relative overflow-visible w-full flex justify-center items-center mt-2 mb-0">
        <motion.div
          className="flex gap-2 flex-wrap justify-center text-5xl font-black font-germania tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
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
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [delayMessage, setDelayMessage] = useState('');
  const timers = useRef([]);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const sanitizedValue = DOMPurify.sanitize(e.target.value);
    setFormData({ ...formData, [e.target.name]: sanitizedValue });
    if (e.target.name === 'password') {
      const strength = zxcvbn(sanitizedValue);
      setPasswordStrength(strength.score); // 0-4
    }
  };
 const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateEmail(formData.email)) {
    setError('Please enter a valid email address...');
    return;
  }

  if (passwordStrength !== null && passwordStrength < 2) {
    setError('Password is too weak. Use a mix of letters, numbers, and symbols...');
    return;
  }

  setLoading(true);
  setDelayMessage('');
await new Promise((resolve) => setTimeout(resolve, 400));
timers.current = [
      setTimeout(() => setDelayMessage('Please donot reload... 🙂'), 5000),
      setTimeout(() => setDelayMessage('Thanks for your patience... ☀️'), 10000),
      setTimeout(() => setDelayMessage('Just a bit longer! ⏳'), 30000),
      setTimeout(() => setDelayMessage('The server is waking up and can take upto a minute...🙂'), 20000),
      setTimeout(() => setDelayMessage('Almost there...'), 40000),
    ];
  try {
    await API.post('/auth/register', {
      name: formData.name,
      email: formData.email,
      password: formData.password
    });

    timers.current.forEach((t) => clearTimeout(t));
    setDelayMessage('');
    setSuccess('🎉 Registration successful! Please check your email and click the link to verify your account.');
    setError('');
    setFormData({ name: '', email: '', password: '' });
    setPasswordStrength(null);
    sessionStorage.setItem("pendingVerificationEmail", formData.email);
    sessionStorage.setItem("justRegistered", "true");
    sessionStorage.setItem("showEmailDelayInfo", "true");
    setTimeout(() => navigate('/login'), 2750);
  } catch (error) {
    console.error('❌ Registration error:', error);
    timers.current.forEach((t) => clearTimeout(t));
    setDelayMessage('');
    const msg = error.response?.data?.error || '❌ Registration failed. Try again.';
    setError(msg);
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
    setPasswordStrength(null);
  } finally {
    setLoading(false);
  }
};


  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const [showPassword, setShowPassword] = useState(false);
  return (
    <motion.div
                initial={{ x:100, opacity: 0}}
                animate={{ x: 0, opacity: 1 }}
                //exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="w-full h-full"
              >
    <PageWrapper backgroundImage="/images/register-bk.webp">
      <div className={` ${boxglow}`}>
      <AnimatedHeadline />  {/* <h1 className="text-5xl font-extrabold font-germania tracking-wider text-shadow-DEFAULT text-center text-emerald-700 dark:text-gray-100 mb-0">Track. Reduce. Inspire</h1> */}
        <p className="text-sm animate-glow text-center text-emerald-500 dark:text-gray-100 mt-2 mb-3">Build your carbon footprint journal with us.</p>

<div className="flex flex-col items-center space-y-1 mb-2">
  {success ? (
    <p className="text-green-500 text-sm text-center animate-pulse">
      {success}
    </p>
  ) : error ? (
    <p className="text-red-600 text-sm text-center animate-bounce">
      {error}
    </p>
  ) : delayMessage ? (
    <p className="text-yellow-500 text-sm text-center animate-pulse">
      {delayMessage}
    </p>
  ) : null}
</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className={`${inputBase} ${inputDark}`}
            required
            autoComplete="name"
            title="Used for your profile"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`${inputBase} ${inputMail}`}
            required
            autoComplete="email"
            title="We'll never spam you, trust me bro"
          />
          {/* <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`${inputBase} ${inputPass}`}
            required
            autoComplete="new-password"
            title="Just for this app"
          /> */}
          <div className="relative">
  <input
    name="password"
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={formData.password}
    onChange={handleChange}
    className={`${inputBase} ${inputPass} pr-12`}
    required
    autoComplete="new-password"
    title="Just for this app"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
  >
    {showPassword ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
</div>
            {passwordStrength !== null && (
              <div className="text-sm text-center mb-2">
                <p>
                  <span className="text-emerald-500 dark:text-gray-100">Password strength:</span>
                  {' '}
                  <span className={`${
                    passwordStrength < 2 ? 'text-red-500' :
                    passwordStrength === 2 ? 'text-yellow-500' :
                    'text-green-500'
                  } animate-pulse`}>
                    {strengthLabel[passwordStrength]}
                  </span>
                </p>
              </div>
            )}
             <SubmitButton
              text={success || 'Register'}
              loading={loading}
              success={!!success}
              disabled={loading || !!success}
            />

        </form>
      </div>
    </PageWrapper>
    </motion.div>
  );
};

export default Register;
