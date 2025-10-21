import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from 'api/api';
import { motion } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import { useAnimation } from 'framer-motion';
import Lottie from 'lottie-react';
import GlobeAnimation from 'animations/Globe.json';
import {  inputBase, inputMail,  boxglow} from 'utils/styles';
import { VerifyEmailButton, CopyButton, SubmitButton, HomeHeaderButton } from 'Components/globalbuttons';
const PasswordDisplay = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTime, setpasswordTime] = useState('');
  const shimmerControls = useAnimation();
  const [expiry, setExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [verified, setVerified] = useState(false);
  const [dataEmail, setDataEmail] = useState(''); 
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [delayMessage, setDelayMessage] = useState('');
  const timers = useRef([]); // for delayed messages

  useEffect(() => {
    const fetchPasswordInfo = async () => {
      try {
        const { data } = await API.get(`/auth/password/${token}`);
        setUserName(data.name);
        setPassword(data.password);
        setDataEmail(data.email); 
        setpasswordTime(data.passwordTime);
        const createdAt = new Date(data.passwordTime);
        const expiryTime = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
        setExpiry(expiryTime);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch password:', error);
        setStatus('error');
      }
    };

    fetchPasswordInfo();
  }, [token]);

 useEffect(() => {
  if (!expiry) return;

  const updateCountdown = () => {
    const now = new Date();
    const diff = expiry - now;

    if (diff <= 0) {
      setTimeLeft('Expired');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    let text = '';
    if (days > 0) text += `${days} day${days > 1 ? 's' : ''} `;
    if (hours > 0) text += `${hours} hour${hours > 1 ? 's' : ''} `;
    if (minutes > 0) text += `${minutes} min${minutes > 1 ? 's' : ''} `;
    if (days === 0 && hours === 0 && minutes === 0) text += `${seconds} sec`;

    setTimeLeft(text.trim());
  };

  updateCountdown(); // call immediately
  const interval = setInterval(updateCountdown, 1000);

  return () => clearInterval(interval);
}, [expiry]);


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

  useEffect(() => {
    shimmerControls.start('animate');
  }, [shimmerControls, userName]);
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
const handleVerify = () => {
  const formattedInput = inputEmail.trim().toLowerCase();
  const formattedData = dataEmail.trim().toLowerCase();

  if (validateEmail(formattedInput) && formattedInput === formattedData) {
  setError('');
  setDelayMessage('Verifying email... ⏳');
  
  timers.current.push(
    setTimeout(() => {
      setVerified(true);
      setDelayMessage('');
      setSuccess('✅ Email verified!');
      timers.current.push( setTimeout(() => { setSuccess(''); }, 3000));
    }, 850)
  );
} else {
  setError('❌ Email does not match or is invalid. Please enter the correct email.');
  timers.current.push( setTimeout(() => { setError(''); }, 3500));
  setSuccess('');
}
};
const getFirstName = (fullName) => {
  if (!fullName) return 'User';
  return fullName.split(' ')[0];
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full h-full"
    >
      <PageWrapper backgroundImage="/images/verify-bk.webp">
        <div className={`${boxglow} text-center text-shadow-DEFAULT w-full max-w-xl p-8 sm:p-10 space-y-4`}>

          {status === 'loading' && (
            <>
              <h1 className="text-5xl font-extrabold font-germania tracking-wider text-center text-shadow-DEFAULT text-emerald-700 dark:text-gray-100 mb-0">
                Loading...
              </h1>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
              >
                <Lottie animationData={GlobeAnimation} loop={true} />
              </motion.div>
            </>
          )}

{status === 'success' && (
  <>
    {/* Greeting */}
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      className="sm:text-5xl text-4xl font-extrabold font-germania tracking-wider text-center text-emerald-700 dark:text-gray-100 mb-0"
    >
     Hello,{" "}
      <motion.span key={userName || "User"}>
        {(getFirstName(userName)).split("").map((char, i) => (
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

    {/* Globe Animation */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
    >
      <Lottie animationData={GlobeAnimation} loop={true} />
    </motion.div>
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

    {/* Email Verification */}
    {!verified && (
      <div className="mb-0">
        <p className="text-sm text-center font-intertight text-shadow-DEFAULT tracking-wide text-shadow-glow text-green-500 dark:text-gray-100 mb-2">
      Enter your email to see your password
       </p>
        <input
          type="email"
          placeholder="Email"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          className={`${inputBase} ${inputMail} mb-4 font-intertight text-shadow-DEFAULT tracking-wide`}
        />
        <VerifyEmailButton onClick={handleVerify} />
      </div>
    )}

    {/* Password Display */}
    {verified && (
      <>
        <p className="text-sm text-center font-intertight text-shadow-DEFAULT tracking-wide text-shadow-glow text-green-500 dark:text-gray-100 mb-4">
          Your password is provided below for your reference.
        </p>

        <div className="relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-4 mb-4"
          >
            <p className="text-2xl font-intertight text-shadow-DEFAULT text-emerald-400 dark:text-white tracking-widest break-all">
              {password}
            </p>
          </motion.div>

          <CopyButton textToCopy={password} />
        </div>

        <p className="text-xs font-intertight text-shadow-DEFAULT tracking-wide text-center text-gray-400 mt-4">
          Ghost to command: password delivered. Operator can log in via email or execute Google login.
          <br />
          <motion.span
                    animate={{ rotateX: [0, 180, 360] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="inline-block"
                  >
                    ⌛
          </motion.span>
          {timeLeft === 'Expired'
            ? '⚠️ This password has expired.'
            : `Expires in ${timeLeft}`}
            
        </p>

      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="text-sm font-intertight text-shadow-DEFAULT tracking-wide text-emerald-500 hover:text-emerald-400 underline"
        >
          Login →
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="text-sm font-intertight text-shadow-DEFAULT tracking-wide text-emerald-500 hover:text-emerald-400 underline"
        >
          Home →
        </motion.button>
      </div>
      </>
    )}
  </>
)}

{status === 'error' && (
  <>
    <h1 className="text-5xl font-extrabold font-germania tracking-wider text-center text-shadow-DEFAULT text-red-600 mb-0">
      Link Invalid
    </h1>
    <p className="text-sm text-center text-shadow-DEFAULT text-green-500 dark:text-red-400 mb-6">
      Your password link is invalid or has expired.
    </p>

    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
    >
      <Lottie animationData={GlobeAnimation} loop={true} />
    </motion.div>

     <div className="flex flex-col gap-4 w-full">
                <div className="w-full">
                  <HomeHeaderButton text="Login" navigateTo="/login" iconType="verify" className="w-full h-14 text-red-500 dark:text-red-400" />
                </div>
                <div className="w-full">
                  <HomeHeaderButton text="Home" navigateTo="/home" iconType="dashboard" className="w-full h-14 text-red-500 dark:text-red-400" />
                </div>
              </div>
  </>
)}

        </div>
      </PageWrapper>
    </motion.div>
  );
};

export default PasswordDisplay;