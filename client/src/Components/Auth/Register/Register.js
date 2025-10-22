import API from 'api/api';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import zxcvbn from 'zxcvbn';
import PageWrapper from 'common/PageWrapper';
import { SubmitButton, GoogleAuthButton } from 'Components/globalbuttons';
import {  inputBase,  inputDark,  inputMail, inputPass,  boxglow, boxglowR} from 'utils/styles';
import { useLocation } from 'react-router-dom';
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
  
const AniDot = () => (
  <span aria-hidden="true" className="inline-flex items-center">
    <motion.span
      className="inline-block text-lg font-normal sm:text-xl sm:font-semibold ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
    > 
      .
    </motion.span>
    <motion.span
      className="inline-block text-lg font-normal sm:text-xl sm:font-semibold ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
    >
      .
    </motion.span>
    <motion.span
      className="inline-block text-lg font-normal sm:text-xl sm:font-semibold ml-1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
    >
      .
    </motion.span>
  </span>
);
  
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
      <div className="relative overflow-visible w-full flex justify-center items-center mt-2 mb-0">
        <motion.div
          className="flex gap-2 flex-wrap justify-center text-3xl sm:text-5xl font-black font-germania tracking-wider text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
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
  const location = useLocation;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [delayMessage, setDelayMessage] = useState('');
  const timers = useRef([]);
  const [passwordPlaceholder, setPasswordPlaceholder] = useState("Password (Not your gmail password)");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
  const timer = setTimeout(() => {
    setPasswordPlaceholder("Password");
  }, 7000); // 5 s
  return () => clearTimeout(timer); 
}, []);
useEffect(() => {
  // Show message when component mounts
  const timer = setTimeout(() => {
    setShowMessage(true);
    
    // Hide message after 4 seconds
    setTimeout(() => {
      setShowMessage(false);
    }, 5000);
  }, 1500); // 1 second delay before showing

  // Cleanup timer on unmount
  return () => clearTimeout(timer);
}, []);

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
    setTimeout(() => { setError(''); }, 3000);
    return;
  }

  if (passwordStrength !== null && passwordStrength < 2) {
    setError('Password is too weak. Use a mix of letters, numbers, and symbols...');
    setTimeout(() => { setError(''); }, 3000);
    return;
  }

  setLoading(true);
  setDelayMessage('');
await new Promise((resolve) => setTimeout(resolve, 200));
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
    setTimeout(() => { setError(''); }, 3000);
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
    setPasswordStrength(null);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const googleAuth = params.get('googleAuth');
  const userName = params.get('userName');
  const source = params.get('source');
  
  if (googleAuth === 'success' && source === 'register') {
    // Store user name in session storage
    if (userName) {
      sessionStorage.setItem('userName', decodeURIComponent(userName));
    }

    setSuccess('🎉 Registration successful! Email sent containing your password. Redirecting to dashboard...');
    
    // Clear URL parameters
    window.history.replaceState({}, '', '/register');
    
    // Redirect to dashboard after showing message
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  }
}, [location.search, navigate]);

// Also add error handling for failed OAuth on register page
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const authError = params.get('error');
  
  if (authError === 'auth_failed') {
    setError('Google registration failed. Please try again.');
    window.history.replaceState({}, '', '/register');
  }
}, [location]);
  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const [showPassword, setShowPassword] = useState(false);
  const [hidePasswordToggle, setHidePasswordToggle] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  return (
    <motion.div
                initial={{ x:100, opacity: 0}}
                animate={{ x: 0, opacity: 1 }}
                //exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="w-full h-full"
              >
    <PageWrapper backgroundImage="/images/register-bk.webp">
      <div className={`${boxglowR} mt-10`}>
      <AnimatedHeadline />    
        <p className="text-xs sm:text-sm animate-glow text-center font-intertight text-shadow-DEFAULT tracking-wide text-emerald-500 dark:text-gray-100 mt-2 mb-0">Build your carbon footprint journal with us.</p>

<div className="flex flex-col items-center space-y-1 mt-2 mb-2 font-intertight text-shadow-DEFAULT tracking-wide">
  {success ? (
    <p className="text-green-500 text-xs sm:text-sm text-center animate-pulse">
      {success}
    </p>
  ) : error ? (
    <p className="text-red-600 text-xs sm:text-sm text-center animate-bounce">
      {error}
    </p>
  ) : delayMessage ? (
    <p className="text-yellow-500 text-xs sm:text-sm text-center animate-pulse">
      {delayMessage}
    </p>
  ) : null}
</div>
{/* <AnimatePresence>
    {showMessage && (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className=" bg-emerald-500/90 dark:bg-black text-white px-3 py-2 -mt-3 mb-2 rounded-xl shadow-lg text-shadow-DEFAULT text-xs sm:text-sm font-intertight text-center z-50"
      >
        <div className="flex items-center sm:ml-6 sm:gap-2">
          <span>Want to skip registration<span className="animate-pulse">?</span> Register with Google<AniDot /></span>
        </div>
      </motion.div>
    )}
  </AnimatePresence> */}
        <form onSubmit={handleSubmit} className="space-y-4 font-intertight text-shadow-DEFAULT tracking-wide">
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
          <div className="relative">
  <input
    name="password"
    type={showPassword ? "text" : "password"}
    placeholder={passwordPlaceholder}
    value={formData.password}
    onChange={handleChange}
    className={`${inputBase} ${inputPass} pr-12`}
    required
    autoComplete="new-password"
    title="Just for this app"
  />
  {formData.password && !hidePasswordToggle && (
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors duration-200 focus:outline-none"
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
  )}
</div>
            {passwordStrength !== null && (
              <div className="text-sm text-center mb-2">
                <p>
                  <span className="text-emerald-500 dark:text-gray-100 font-intertight text-shadow-DEFAULT tracking-wide">Password strength:</span>
                  {' '}
                  <span className={`${
                    passwordStrength < 2 ? 'text-red-500' :
                    passwordStrength === 2 ? 'text-yellow-500' :
                    'text-green-500'
                  } animate-pulse font-intertight text-shadow-DEFAULT tracking-wide`}>
                    {strengthLabel[passwordStrength]}
                  </span>
                </p>
              </div>
            )}
             <SubmitButton text={success || 'Register'} loading={loading} success={!!success} disabled={loading || !!success} />
             <GoogleAuthButton loading={false} />
<div className="ml-1 text-xs sm:text-sm animate-glow text-center font-intertight text-shadow-DEFAULT tracking-wide text-gray-600 dark:text-gray-100">
  <p>
    By registering, you agree to our{' '}
    <a
      href="https://carbonft.app/privacypolicy.html"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-emerald-500 transition-colors duration-200"
    >
      Privacy Policy
    </a>{' '}
    and{' '}
    <a
      href="https://carbonft.app/privacypolicy.html"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-emerald-500 transition-colors duration-200"
    >
      Terms
    </a>.
  </p>
</div>
        </form>
      </div>
    </PageWrapper>
    </motion.div>
  );
};

export default Register;
