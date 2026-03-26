import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from 'api/api';
import { motion } from 'framer-motion';
import { useAnimation } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import { boxglow, inputBase, inputPass } from 'utils/styles';
import { CancelButton, SaveButton } from 'Components/globalbuttons';
import Lottie from 'lottie-react';
import GlobeAnimation from 'animations/Globe.json';

// Animated Hello Name Component
const AnimatedHelloName = ({ name }) => {
  const shimmerControls = useAnimation();

  const letterVariants = {
    initial: { opacity: 0 },
    animate: (i) => ({
      opacity: [0, 1, 0.6, 1],
      transition: {
        delay: i * 0.05,
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 1.2,
        ease: 'linear',
      },
    }),
  };

  const firstName = (name || "User").trim().split(" ")[0];

  useEffect(() => {
    shimmerControls.start('animate');
  }, [shimmerControls, name]);

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.2 }}
      className="sm:text-5xl text-4xl font-extrabold font-germania tracking-wider text-center text-emerald-700 dark:text-gray-100 mb-2"
    >
      Hello,{" "}
      <motion.span key={firstName}>
        {firstName.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            custom={i}                 
            variants={letterVariants}     
            initial="initial"              
            animate={shimmerControls}       
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </motion.div>
  );
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const [userData, setUserData] = useState({ name: '', email: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const [validationErrors, setValidationErrors] = useState({ password: '', confirmPassword: '' });

  // Fetch user info for this reset token
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setStatus('loading');
        setError(''); // Clear any previous errors
        const { data } = await API.get(`/auth/reset-password/${token}/preview`);
        setUserData(data);
        setStatus('idle');
      } catch (err) {
        console.error('Failed to verify reset token:', err);
        let errorMessage = 'Reset link is invalid or has expired.';
        
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          // Handle JSON parse errors or other network errors
          if (err.message.includes('Unexpected token') || err.message.includes('Invalid response')) {
            errorMessage = 'Server error occurred. Please try requesting a new reset link.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
        setStatus('error');
      }
    };

    if (token) {
      fetchUserInfo();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRateLimitError('');
    
    // Custom validation with comprehensive checks
    const errors = { password: '', confirmPassword: '' };
    
    // Password validation
    if (!password.trim()) {
      errors.password = "Enter your secret key to continue.";
    } else if (password.length < 6) {
      errors.password = "Your key seems short — at least 6 characters, please.";
    } else if (password.length > 128) {
      errors.password = "That's a mighty long key — keep it under 128 characters.";
    }
    
    // Confirm password validation
    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Confirm your secret key to continue.";
    } else if (confirmPassword.length < 6) {
      errors.confirmPassword = "Your key seems short — at least 6 characters, please.";
    } else if (confirmPassword.length > 128) {
      errors.confirmPassword = "That's a mighty long key — keep it under 128 characters.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "These don't match — double-check your keys.";
    }
    
    if (errors.password || errors.confirmPassword) {
      setValidationErrors(errors);
      setTimeout(() => setValidationErrors({ password: '', confirmPassword: '' }), 5000);
      return;
    }

    // Rate limiting - 1 reset per 10 minutes per token
    const tokenHash = token.substring(0, 16);
    const cacheKey = `reset_password_attempt_${tokenHash}`;
    const lastAttempt = localStorage.getItem(cacheKey);
    const now = Date.now();
    const tenMinutesMs = 10 * 60 * 1000;

    if (lastAttempt) {
      const timeSinceAttempt = now - parseInt(lastAttempt);
      if (timeSinceAttempt < tenMinutesMs) {
        const remainingMs = tenMinutesMs - timeSinceAttempt;
        const remainingMins = Math.ceil(remainingMs / 60000);
        const rateLimitMsg = `Please try again in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}. Only 1 reset per 10 minutes allowed.`;
        setRateLimitError(rateLimitMsg);
        setError(rateLimitMsg);
        return;
      }
    }

    setLoading(true);
    setStatus('loading');

    try {
      await API.post('/auth/reset-password', {
        token,
        password,
        confirmPassword
      });

      // Store rate limit attempt timestamp
      localStorage.setItem(cacheKey, Date.now().toString());

      setStatus('success');
      setPassword('');
      setConfirmPassword('');
      setValidationErrors({ password: '', confirmPassword: '' });

      setTimeout(() => {
        navigate('/login?passwordReset=success');
      }, 3000);
    } catch (err) {
      let errorMsg = 'Failed to reset password. Please try again.';
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        if (err.message.includes('Unexpected token') || err.message.includes('Invalid response')) {
          errorMsg = 'Server error occurred. Please try requesting a new reset link.';
        } else if (err.message.includes('timeout')) {
          errorMsg = 'Request took too long. Please try again.';
        } else {
          errorMsg = err.message;
        }
      }
      
      setError(errorMsg);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' && !userData.name) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full h-full"
      >
        <PageWrapper backgroundImage="/images/verify-bk.webp">
          <div className={`${boxglow} text-center w-full max-w-xl p-8 sm:p-10 space-y-4`}>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-germania tracking-wider text-center text-shadow-DEFAULT text-emerald-700 dark:text-gray-100 mb-6">
              Verifying Link
            </h1>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
            >
              <Lottie animationData={GlobeAnimation} loop={true} />
            </motion.div>
            <p className="text-sm text-center text-shadow-glow text-green-500 dark:text-gray-100 mb-6">
              Checking your reset link...
            </p>
          </div>
        </PageWrapper>
      </motion.div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full h-full"
      >
        <PageWrapper backgroundImage="/images/verify-bk.webp">
          <div className={`${boxglow} text-center text-shadow-DEFAULT w-full max-w-xl p-8 sm:p-10 space-y-4`}>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-germania tracking-wider text-center text-shadow-DEFAULT text-red-600 mb-0">
              Link Invalid
            </h1>
            <p className="text-sm text-center text-shadow-glow text-red-500 dark:text-gray-100 mb-6">
              {error || 'Your reset link has expired or is invalid.'}
            </p>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
            >
              <Lottie animationData={GlobeAnimation} loop={true} />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-6 py-3 mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold font-intertight tracking-wider rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              Back to Login
            </motion.button>
          </div>
        </PageWrapper>
      </motion.div>
    );
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full h-full"
      >
        <PageWrapper backgroundImage="/images/verify-bk.webp">
          <div className={`${boxglow} text-center text-shadow-DEFAULT w-full max-w-xl p-8 sm:p-10 space-y-4`}>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-germania tracking-wider text-center text-shadow-DEFAULT text-emerald-700 dark:text-gray-100 mb-0">
              Password Reset!
            </h1>
            <p className="text-sm text-center text-shadow-glow text-green-500 dark:text-gray-100 mb-6">
              Your password has been updated successfully. Redirecting to login...
            </p>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Lottie animationData={GlobeAnimation} loop={true} />
            </motion.div>
          </div>
        </PageWrapper>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full h-full"
    >
      <PageWrapper backgroundImage="/images/verify-bk.webp">
        <div className={`${boxglow} text-center text-shadow-DEFAULT w-full max-w-xl p-8 sm:p-10 space-y-4`}>
          

          {/* Hello {name} with animation */}
          <AnimatedHelloName name={userData.name} />

          <p className="text-xs sm:text-sm text-center text-shadow-glow text-green-500 dark:text-gray-100 mb-3 font-intertight">
            Create a new password for your account
          </p>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-32 mx-auto mt-1 mb-3 cursor-pointer"
          >
            <Lottie animationData={GlobeAnimation} loop={true} />
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4"
            >
              <p className="text-red-500 text-sm font-intertight text-shadow-DEFAULT flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </p>
            </motion.div>
          )}

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3 font-intertight text-shadow-DEFAULT tracking-wide">
            {/* New Password */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={validationErrors.password ? "" : "New Password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                  setValidationErrors(prev => ({ ...prev, password: '' }));
                }}
                disabled={loading}
                className={`${inputBase} ${inputPass} font-intertight text-shadow-DEFAULT tracking-wide ${validationErrors.password ? '!border-red-500 animate-pulse' : ''}`}
                autoComplete="new-password"
              />
              {validationErrors.password && (
                <div className="absolute inset-0 flex items-center px-4 bg-black/90 text-white rounded-xl text-sm font-intertight font-normal text-shadow-DEFAULT tracking-wide z-10 pointer-events-none w-full h-full">
                  <span className="animate-lock-secure mr-2">🔒</span>
                  <span>{validationErrors.password}</span>
                </div>
              )}
              {password && !validationErrors.password && !loading && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors duration-200 focus:outline-none"
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

            {/* Confirm Password */}
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={validationErrors.confirmPassword ? "" : "Confirm Password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                  setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                disabled={loading}
                className={`${inputBase} ${inputPass} font-intertight text-shadow-DEFAULT tracking-wide ${validationErrors.confirmPassword ? '!border-red-500 animate-pulse' : ''}`}
                autoComplete="new-password"
              />
              {validationErrors.confirmPassword && (
                <div className="absolute inset-0 flex items-center px-4 bg-black/90 text-white rounded-xl text-sm font-intertight font-normal text-shadow-DEFAULT tracking-wide z-10 pointer-events-none w-full h-full">
                  <span className="animate-lock-secure mr-2">🔒</span>
                  <span>{validationErrors.confirmPassword}</span>
                </div>
              )}
              {confirmPassword && !validationErrors.confirmPassword && !loading && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors duration-200 focus:outline-none"
                >
                  {showConfirmPassword ? (
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

            {/* Password Form Buttons */}
            <div className="flex gap-3 pt-3">
              <div className="flex-1">
                <CancelButton
                  onClick={() => navigate('/login')}
                  disabled={loading}
                  styleOverride={{ width: '100%', height: '3rem' }}
                />
              </div>
              <div className="flex-1">
                <SaveButton
                  text={loading ? "Updating..." : "Save Password"}
                  disabled={false}
                  styleOverride={{ width: '100%', height: '3rem' }}
                />
              </div>
            </div>
          </form>
        </div>
      </PageWrapper>
    </motion.div>
  );
};

export default ResetPassword;
