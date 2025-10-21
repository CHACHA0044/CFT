import API from 'api/api';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import { SubmitButton, GoogleAuthButton } from 'Components/globalbuttons';
import { inputBase, inputMail, inputPass, boxglow } from 'utils/styles';
import Lottie from 'lottie-react';
import GlobeAnimation from 'animations/Globe.json';

  const sentence = "Log in";
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
      <div className="relative overflow-visible w-full flex justify-center items-center mt-2 mb-2">
        <motion.div
          className="flex sm:flex-nowrap flex-wrap justify-center gap-1 text-5xl sm:text-6xl font-black font-germania tracking-widest text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
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
  });
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendCount, setResendCount] = useState( Number(sessionStorage.getItem("resendCount")) || 0);
  const [hidePasswordToggle, setHidePasswordToggle] = useState(false);
  const [success, setSuccess] = useState(
  sessionStorage.getItem('justVerified') ? 'Your email has been verified! Please login.' : ''
);
  
useEffect(() => {
  if (sessionStorage.getItem("justRegistered")) {
    setShowResend(true);
    sessionStorage.removeItem("justRegistered");
  }
}, []);
const [smtpMessage, setsmtpMessage] = useState('');
  useEffect(() => {
  if (sessionStorage.getItem("showEmailDelayInfo")) {
    setsmtpMessage(
      "Verification email sent! Delivery can sometimes take up to 3–5 minutes because Gmail SMTP isn’t designed for instant transactional emails..."
    );
    sessionStorage.removeItem("showEmailDelayInfo");

    const timer = setTimeout(() => {
      setsmtpMessage("");
    }, 20000);

    return () => clearTimeout(timer); 
  }
}, []);
useEffect(() => {
  if (success?.toLowerCase().includes("verified")) {
    sessionStorage.removeItem("justVerified");
    setResendCount(0);
    sessionStorage.removeItem("resendCount");
  }
}, [success]);

  const [delayMessage, setDelayMessage] = useState('');
  const timers = useRef([]);
  const [cooldown, setCooldown] = useState(0);
    const mV = Boolean(success || error || delayMessage || showResend || cooldown > 0 || smtpMessage);
useEffect(() => {
  if (cooldown <= 0) return; 

  const interval = setInterval(() => {
    setCooldown((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setShowResend(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [cooldown]);

// Format mm:ss
const formatTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password" && e.target.value) {
    setHidePasswordToggle(false);   
  }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setHidePasswordToggle(true);
  setLoading(true);
  setError('');
  setSuccess('');
  setDelayMessage('');
  setShowResend(false);

  await new Promise((resolve) => setTimeout(resolve, 300));
  
  timers.current = [
    setTimeout(() => setDelayMessage('Please do not reload... '), 5000),
    setTimeout(() => setDelayMessage('Thanks for your patience... '), 10000),
    setTimeout(() => setDelayMessage('Just a bit longer! '), 30000),
    setTimeout(() => setDelayMessage('The server is waking up...'), 20000),
    setTimeout(() => setDelayMessage('Almost there...'), 40000),
  ];

  try {
    // Login request - cookie will be set automatically by proxy
    await API.post('/auth/login', formData);
    timers.current.forEach((t) => clearTimeout(t));
    setDelayMessage('');
    const userResponse = await API.get('/auth/token-info/me');
    sessionStorage.setItem('userName', userResponse.data.name);
    setSuccess('Login Successful! 😎');
    setError('');

    // Verify cookie was set
    try {
      await API.get('/auth/token-info/me');
      console.log('Cookie authentication successful');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (verifyErr) {
      console.error('Cookie verification failed:', verifyErr);
      setError('Authentication failed. Please try again.');
      setLoading(false);
      return;
    }

  } catch (err) {
    console.error('Login error:', err);
    timers.current.forEach((t) => clearTimeout(t));
    setDelayMessage('');
    
    if (err.response?.status === 403) {
      setError('Please verify your email.');
      if (cooldown === 0) setShowResend(true);
    } else if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError('Something went wrong. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  return () => timers.current.forEach((t) => clearTimeout(t));
}, []);

  return (
  <motion.div
        initial={{ x:100, opacity: 0}}
        animate={{ x: 0, opacity: 1 }}
        //exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full h-full"
      >
    <PageWrapper backgroundImage="/images/login-bk.webp">
      <div className={`${boxglow} flex items-center sm:space-x-1 sm:mb-2 mb-0 mt-12`}>
        <div className="flex items-center ml-12 space-x-0"><AnimatedHeadline />
        <motion.div
    key="globe"
    initial="hidden"
    animate="visible"
    exit="hidden"
    whileHover={{ scale: 1.3 }}
    whileTap={{ scale: 0.95 }}
    className="w-10" 
  >
    <Lottie animationData={GlobeAnimation} loop />
  </motion.div></div>
  
<div className="flex flex-col items-center space-y-1 mb-[-2]">
  {success ? (
    <p className="text-green-500 text-sm text-center animate-pulse">
      {success}
    </p>
  ) : (error || showResend || cooldown > 0) ? (
    <>
      <p className="text-red-600 text-sm text-center animate-bounce">
        {error}
      </p>
      {showResend && cooldown === 0 && resendCount < 3 ? (
  <div className="flex flex-col items-center space-y-2">
    <h6 className="text-emerald-500 dark:text-gray-100 text-sm tracking-normal sm:tracking-wider font-intertight text-shadow-DEFAULT flex flex-col">
      <span>
    Didn<span className="animate-pulse">’</span>t receive the mail{" "}
              <span className="animate-pulse">?</span>
  </span>
  <span>
    [Attempts remaining: <span className="animate-pulse">{3 - resendCount}</span>]
  </span>
    </h6>
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.90 }}
      transition={{
        type: "spring",
        stiffness: 600,
        damping: 20,
        duration: 0.25,
      }}
      onClick={async () => {
        const emailToUse =
          formData.email || sessionStorage.getItem("pendingVerificationEmail");
        if (!emailToUse) {
          setError("No email found. Please enter your email.");
          return;
        }
        if (resendCount >= 3) {
        setError("Maximum resends reached...");
        setShowResend(false);
        return;
      }
        try {
        await API.post("/auth/resend-verification", { email: emailToUse });
        const newCount = resendCount + 1;
        setResendCount(newCount);
        sessionStorage.setItem("resendCount", newCount);
        setShowResend(false); 
        setCooldown(184);
        setError("");
        setSuccess("Verification email resent!");
        setTimeout(() => setSuccess(""), 4500);
        } catch (err) {
         if (err.response?.data?.error === 'User already verified') {
        setSuccess('✅ Your account is already verified.');
        setShowResend(false); 
        } else {
        setError(err.response?.data?.error || '❌ Failed to resend email.');
        }
          setTimeout(() => setError(""), 4500);
        }
      }}
      className="text-blue-400 text-sm underline hover:text-blue-700 transition font-sriracha tracking-wider text-shadow-DEFAULT"
    >
      Resend verification email
    </motion.button>
  </div>
) : null}

     {cooldown > 0 && (
       <div className="flex flex-col items-center space-y-1">
         <h6 className="text-emerald-500 dark:text-gray-100 text-sm tracking-normal sm:tracking-wider font-intertight text-shadow-DEFAULT flex flex-col">
          <span>
          Didn<span className="animate-pulse">’</span>t receive the mail{" "}
          <span className="animate-pulse">?</span>
        </span>
        <span>
          [Attempts remaining: <span className="animate-pulse">{3 - resendCount}</span>]
        </span>
         </h6>
         <motion.p className="text-gray-400 text-sm flex items-center space-x-1">
           <motion.span
             animate={{ rotateX: [0, 180, 360] }}
             transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
             className="inline-block"
           >
             ⌛
           </motion.span>
           <span>
             You can resend again in{" "}
             <span className="font-semibold animate-pulse">{formatTime(cooldown)}</span>
           </span>
         </motion.p>
       </div>
     )}


    </>
  ) : delayMessage ? (
    <p className="text-yellow-500 text-sm text-center animate-pulse">
      {delayMessage}
    </p>
  ) : null}
</div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-intertight text-shadow-DEFAULT tracking-wide">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`${inputBase} ${inputMail}`}
            required
            autoComplete="email"
            title="The email u used"
          />        
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`${inputBase} ${inputPass}`}
              required
              autoComplete="current-password"
              title="Password used"
            />
            {formData.password && !hidePasswordToggle && !mV && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-9 md:right-12 top-[185px] md:top-[209px] transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors duration-200 focus:outline-none"
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
          
   <SubmitButton text="Login" loading={loading} success={success.startsWith('Login Successful')} disabled={loading} />
   <GoogleAuthButton loading={false} />
        </form>
      </div>
    </PageWrapper>
    </motion.div>
  );
};

export default Login;
