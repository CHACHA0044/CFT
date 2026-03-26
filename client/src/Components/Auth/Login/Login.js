import API from 'api/api';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import { SubmitButton, GoogleAuthButton, ForgotPasswordButton, CancelButton, SaveButton } from 'Components/globalbuttons';
import { inputBase, inputMail, inputPass, boxglow } from 'utils/styles';
import Lottie from 'lottie-react';
import GlobeAnimation from 'animations/Globe.json';
import { useLocation } from 'react-router-dom';

  const sentence = "Login";
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
      <h1 className="text-4xl font-black font-germania text-white text-center tracking-wider text-shadow-DEFAULT">
        {sentence}
      </h1>
    );
  }

  return (
    <div className="relative overflow-visible w-full flex justify-center items-center mt-2 mb-2">
        <motion.div
          className="flex sm:flex-nowrap flex-wrap justify-center gap-1 text-5xl sm:text-6xl font-black font-germania tracking-widest text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
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
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const location = useLocation();
  const [showResend, setShowResend] = useState(false);
  const [resendCount, setResendCount] = useState( Number(sessionStorage.getItem("resendCount")) || 0);
  const [hidePasswordToggle, setHidePasswordToggle] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ email: '', password: '' });
  const [verificationEmail, setVerificationEmail] = useState(
  sessionStorage.getItem("pendingVerificationEmail") || ""
);
  const [success, setSuccess] = useState(
  sessionStorage.getItem('justVerified') ? 'Your email has been verified! Please login.' : ''
);

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [forgotPasswordRateLimited, setForgotPasswordRateLimited] = useState(false);
  const [forgotPasswordCooldown, setForgotPasswordCooldown] = useState(0);
  
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
  const [shakeForm, setShakeForm] = useState(false);
  const mV = Boolean(success || error || delayMessage || showResend || cooldown > 0 || smtpMessage);

  const handleOpenForgotPasswordModal = () => {
    setForgotPasswordEmail(formData.email);
    setShowForgotPassword(true);
  };

const handleForgotPassword = async () => {
  setForgotPasswordError('');
  
  // Custom validation with comprehensive checks
  const errors = { email: '' };
  
  // Email validation
  if (!forgotPasswordEmail.trim()) {
    errors.email = "Which email did you use?";
  } else if (!forgotPasswordEmail.includes("@")) {
    errors.email = "That doesn't look right — missing an @ symbol?";
  } else if (!/\S+@\S+/.test(forgotPasswordEmail)) {
    errors.email = "Something's off after the @ — double-check your email.";
  } else if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
    errors.email = "Almost there! Add a domain like .com or .org.";
  } else if (forgotPasswordEmail.length > 254) {
    errors.email = "That email looks a bit long — keep it under 254 characters.";
  }
  
  if (errors.email) {
    setForgotPasswordError(errors.email);
    setTimeout(() => setForgotPasswordError(''), 5000);
    return;
  }

  // Rate limiting - Check if user already requested reset in past hour
  const cacheKey = `forgot_password_${forgotPasswordEmail.toLowerCase()}`;
  const lastAttempt = localStorage.getItem(cacheKey);
  const now = Date.now();
  const oneHourMs = 60 * 60 * 1000;

  if (lastAttempt) {
    const timeSinceAttempt = now - parseInt(lastAttempt);
    if (timeSinceAttempt < oneHourMs) {
      const remainingMs = oneHourMs - timeSinceAttempt;
      const remainingMins = Math.ceil(remainingMs / 60000);
      setForgotPasswordError(`Please try again in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}. Only 1 reset per hour.`);
      setTimeout(() => setForgotPasswordError(''), 5000);
      return;
    }
  }

  setForgotPasswordLoading(true);
  setForgotPasswordSuccess('');

  try {
    const { data } = await API.post('/auth/forgot-password', { 
      email: forgotPasswordEmail.trim() 
    });
    
    // Store timestamp for rate limiting
    localStorage.setItem(cacheKey, Date.now().toString());
    
    setForgotPasswordSuccess('Password reset link has been sent to your email!');
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    
    // Show success message at top
    setSuccess('Check your email for the password reset link. It expires in 15 minutes.');
    setTimeout(() => {
      setForgotPasswordSuccess('');
      setSuccess('');
    }, 5000);
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to send reset email. Try again.';
    setForgotPasswordError(errorMsg);
    setTimeout(() => setForgotPasswordError(''), 4000);
  } finally {
    setForgotPasswordLoading(false);
  }
};
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
  
  // Custom validation with comprehensive checks
  const errors = { email: '', password: '' };
  
// Email validation
if (!formData.email.trim()) {
  errors.email = "Which email did you use?";
} else if (!formData.email.includes("@")) {
  errors.email = "That doesn’t look right — missing an @ symbol?";
} else if (!/\S+@\S+/.test(formData.email)) {
  errors.email = "Something’s off after the @ — double-check your email.";
} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
  errors.email = "Almost there! Add a domain like .com or .org.";
} else if (formData.email.length > 254) {
  errors.email = "That email looks a bit long — keep it under 254 characters.";
}

// Password validation
if (!formData.password.trim()) {
  errors.password = "Enter your secret key to continue.";
} else if (formData.password.length < 6) {
  errors.password = "Your key seems short — at least 6 characters, please.";
} else if (formData.password.length > 128) {
  errors.password = "That’s a mighty long key — keep it under 128 characters.";
}
  
  if (errors.email || errors.password) {
    setValidationErrors(errors);
    setTimeout(() => setValidationErrors({ email: '', password: '' }), 5000);
    return;
  }
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
    sessionStorage.setItem('justLoggedIn', 'true');
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
    // trigger shake animation
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 600);
    
    if (err.response?.status === 403) {
      setError('Please verify your email.');
      setVerificationEmail(formData.email);
      sessionStorage.setItem("pendingVerificationEmail", formData.email);
      if (cooldown === 0) setShowResend(true);
    } else if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError('Something went wrong. Please try again.');
    }
    setTimeout(() => {setError('');}, 3500);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const googleAuth = params.get('googleAuth');
  const userName = params.get('userName');
  const firstTime = params.get('firstTime');
  
  if (googleAuth === 'success') {
    if (userName) {
      sessionStorage.setItem('userName', decodeURIComponent(userName));
    }
    
    // Set first-time flag for Google users
    if (firstTime === 'true') {
      sessionStorage.setItem('isFirstTimeUser', 'true');
    }
    
    setSuccess('Login Successful! 😎');
    window.history.replaceState({}, '', '/login');
    setTimeout(() => { navigate('/dashboard'); }, 3250);
  }
}, [location.search, navigate]);

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const googleAuth = params.get('googleAuth');
  const userName = params.get('userName');
  const firstTime = params.get('firstTime');
  
  if (googleAuth === 'success') {
    if (userName) {
      sessionStorage.setItem('userName', decodeURIComponent(userName));
    }
    
    // Set first-time flag for Google users who are registering
    if (firstTime === 'true') {
      sessionStorage.setItem('isFirstTimeUser', 'true');
    } else {
      // This is a returning user logging in with Google
      sessionStorage.setItem('justLoggedIn', 'true');
    }
    
    setSuccess('Login Successful! 😎');
    window.history.replaceState({}, '', '/login');
    setTimeout(() => { navigate('/dashboard'); }, 3000);
  }
}, [location.search, navigate]);
useEffect(() => {
  return () => timers.current.forEach((t) => clearTimeout(t));
}, []);
const handleResendVerification = async () => {
  if (!verificationEmail) {
    setError("Please enter a valid email.");
    return;
  }

  if (resendCount >= 3) {
    setError("Maximum resend attempts reached.");
    return;
  }

  try {
    await API.post("/auth/resend-verification", {
      email: verificationEmail
    });

    const newCount = resendCount + 1;
    setResendCount(newCount);
    sessionStorage.setItem("resendCount", newCount);

    setSuccess("Verification email resent!");
    setError("");
    setShowResend(false);
    setCooldown(62);

    setTimeout(() => setSuccess(""), 4000);
  } catch (err) {
    setError(err.response?.data?.error || "Failed to resend email.");
    setTimeout(() => setError(""), 4000);
  }
};

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
        <div className="flex items-center ml-12 mb-2 space-x-0"><AnimatedHeadline />
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
    <p className="text-green-500 text-sm font-intertight text-shadow-DEFAULT sm:tracking-wide text-center animate-pulse">
      {success}
    </p>
  ) : (error || showResend || cooldown > 0) ? (
    <>
      <p className="text-red-500 text-sm text-center font-intertight text-shadow-DEFAULT sm:tracking-wide">
        {error}
      </p>
      {showResend && cooldown === 0 && resendCount < 3 ? (
  <div className="flex flex-col items-center space-y-2">
    <h6 className="text-emerald-500 dark:text-gray-100 text-sm tracking-normal sm:tracking-wider font-intertight text-shadow-DEFAULT flex flex-col">
      <span>
    Didn<span className="animate-pulse">’</span>t receive the mail{" "}?          
  </span>
  <span>
    [Attempts remaining: <span className="animate-pulse">{3 - resendCount}</span>]
  </span>
    </h6>
   <div className="flex flex-col items-center space-y-2">
  <span className="text-emerald-500 text-sm font-intertight text-shadow-DEFAULT">
    Verification email was sent to:
  </span>

  <input
    type="email"
    value={verificationEmail}
    onChange={(e) => setVerificationEmail(e.target.value)}
    className={`${inputBase} ${inputMail} text-center`}
    placeholder="Enter correct email"
  />

  <motion.button
    type="button"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleResendVerification}
    className="text-blue-400 text-sm underline hover:text-blue-700 transition font-intertight tracking-wider"
  >
    Resend verification email
  </motion.button>
</div>
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
    <p className="text-yellow-500 text-sm text-center font-intertight text-shadow-DEFAULT tracking-wide animate-pulse">
      {delayMessage}
    </p>
  ) : null}
</div>
<form onSubmit={handleSubmit} className={`mt-5 space-y-4 font-intertight text-shadow-DEFAULT tracking-wide w-full ${
  (validationErrors.email || validationErrors.password || shakeForm) ? 'animate-shake' : ''
}`} noValidate>
<div className="relative w-full max-w-full">
    <input
      name="email"
      type="email"
      placeholder={validationErrors.email ? "" : "Email"}
      value={formData.email}
      onChange={handleChange}
      className={`${inputBase} ${inputMail} ${validationErrors.email ? '!border-red-500 animate-pulse' : ''}`}
      autoComplete="email"
      title="The email u used"
    />
    
    {validationErrors.email && (
      <div className="absolute inset-0 flex items-center px-4 bg-black/90 text-white rounded-xl text-sm font-intertight font-normal text-shadow-DEFAULT tracking-wide z-10 pointer-events-none w-full h-full">
        <span className="animate-mail-deliver mr-2">📧</span>
        <span>{validationErrors.email}</span>
      </div>
    )}
  </div>
  
<div className="relative w-full max-w-full">
    <input
      name="password"
      type={showPassword ? "text" : "password"}
      placeholder={validationErrors.password ? "" : "Password"}
      value={formData.password}
      onChange={handleChange}
      className={`${inputBase} ${inputPass} ${validationErrors.password ? '!border-red-500 animate-pulse' : ''}`}
      autoComplete="current-password"
      title="Password used"
    />
    
    {validationErrors.password && (
      <div className="absolute inset-0 flex items-center px-4 bg-black/90 text-white rounded-xl text-sm font-intertight font-normal text-shadow-DEFAULT tracking-wide z-10 pointer-events-none w-full h-full">
        <span className="animate-lock-secure mr-2">🔒</span>
        <span>{validationErrors.password}</span>
      </div>
    )}
    
    {formData.password && !hidePasswordToggle && !mV && (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors duration-200 focus:outline-none "
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

  <SubmitButton text="Login" loading={loading} success={success.startsWith('Login Successful')} disabled={loading} />
  
  {/* Forgot Password / Google Button - Toggle based on email input */}
  <AnimatePresence mode="wait">
    {formData.email.trim() ? (
      <motion.div
        key="forgotPassword"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <ForgotPasswordButton 
            onClick={handleOpenForgotPasswordModal}
          disabled={forgotPasswordLoading}
        />
      </motion.div>
    ) : (
      <motion.div
        key="googleAuth"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <GoogleAuthButton loading={false} />
      </motion.div>
    )}
  </AnimatePresence>
</form>
      </div>
    </PageWrapper>

    {/* Forgot Password Modal */}
    <AnimatePresence>
      {showForgotPassword && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !forgotPasswordLoading && setShowForgotPassword(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={`${boxglow} w-full max-w-sm p-8 space-y-4`}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-gray-100 mb-2 font-germania tracking-wider text-center text-shadow-DEFAULT">
              Reset Password
            </h2>

                {forgotPasswordSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <motion.svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                </div>
                <p className="text-green-500 text-lg font-intertight tracking-wide text-shadow-DEFAULT">
                  {forgotPasswordSuccess}
                </p>
                <p className="text-sm text-gray-400 font-intertight">
                  Check your email for the reset link. Link expires in 15 minutes.
                </p>
              </motion.div>
            ) : (
              <>
                <p className="text-sm text-gray-400 text-center font-intertight text-shadow-DEFAULT mb-6">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>

                <div className="relative w-full">
                  <input
                    type="email"
                    placeholder={forgotPasswordError ? "" : "Registered email"}
                    value={forgotPasswordEmail}
                    onChange={(e) => {
                      setForgotPasswordEmail(e.target.value);
                      setForgotPasswordError('');
                    }}
                    disabled={forgotPasswordLoading}
                    className={`${inputBase} ${forgotPasswordError ? '!border-red-500 animate-pulse' : ''}`}
                    autoComplete="email"
                  />
                  
                  {forgotPasswordError && (
                    <div className="absolute inset-0 flex items-center px-4 bg-black/90 text-white rounded-xl text-sm font-intertight font-normal text-shadow-DEFAULT tracking-wide z-10 pointer-events-none w-full h-full">
                      <span className="animate-mail-deliver mr-2">📧</span>
                      <span>{forgotPasswordError}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <div className="flex-1">
                    <CancelButton
                      onClick={() => setShowForgotPassword(false)}
                      disabled={forgotPasswordLoading}
                      styleOverride={{ width: '100%', height: '3rem' }}
                    />
                  </div>
                  <div className="flex-1">
                    <SaveButton
                      text={forgotPasswordLoading ? "Sending..." : "Send Link"}
                      onClick={handleForgotPassword}
                      disabled={forgotPasswordLoading}
                      styleOverride={{ width: '100%', height: '3rem' }}
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </motion.div>
  );
};

export default Login;
