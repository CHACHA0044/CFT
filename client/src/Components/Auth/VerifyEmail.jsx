import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from 'api/api';
import { motion } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import { boxglow, heading, subheading } from 'utils/styles';
import { useLoading } from 'context/LoadingContext';
import { VerifyButton } from 'Components/globalbuttons';
import Lottie from 'lottie-react';
import GlobeAnimation from 'animations/Globe.json';
import { useAnimation } from 'framer-motion';
const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [userName, setUserName] = useState('');
  const shimmerControls = useAnimation();
  // Fetch username associated with the token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get(`/auth/token-info/me?token=${token}`);
        setUserName(data.name);
      } catch (error) {
        console.error('❌ Could not fetch user info:', error);
        setStatus('error');
      }
    };
    fetchUser();
  }, [token]);

  const handleVerify = async () => {
    setStatus('verifying');
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      await API.get(`/auth/verify-email/${token}`);
      setStatus('success');
      sessionStorage.setItem('justVerified', 'true');
      setTimeout(() => navigate('/login'), 3000); // subtle 3s delay
    } catch (error) {
      console.error('❌ Email verification failed:', error);
      setStatus('error');
    }
  };
useEffect(() => {
  shimmerControls.start((i) => ({
    opacity: [0, 1, 0.6, 1],
    transition: {
      delay: i * 0.05,
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1.2,
    },
  }));
}, [shimmerControls]);
// Add this near top of component (already have useAnimation imported)
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

  return (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    className="w-full h-full"
  >
    <PageWrapper backgroundImage="/images/verify-bk.webp">
      <div className={`${boxglow} text-center text-shadow-DEFAULT w-full max-w-xl p-8 sm:p-10 space-y-4`}>
        {status === 'idle' && (
          <>
          <motion.div
  initial={{ y: -30, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 500, damping: 15 }}
  className="sm:text-5xl text-3xl font-extrabold font-germania tracking-wider text-center text-emerald-700 dark:text-gray-100 mb-0"
>
  Hello,{" "}
  <motion.span key={userName || "User"}>
    {(userName || "User").split("").map((char, i) => (
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
             <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
      onClick={handleVerify}
    >
      <Lottie animationData={GlobeAnimation} loop={true} />
    </motion.div>
            <p className="text-sm text-center text-shadow-glow text-green-500 dark:text-gray-100 mb-6">Click the button below to verify your email...</p>
            <VerifyButton
              onClick={handleVerify}
              disabled={status === 'verifying'}
              className="w-full"
            />
            
          </>
        )}

        {status === 'verifying' && (
          <>
            <h1 className="text-5xl font-extrabold font-germania tracking-wider text-center text-shadow-DEFAULT text-emerald-700 dark:text-gray-100 mb-0">Verifying your email...</h1>
            <p className="text-sm text-center text-shadow-glow text-green-500 dark:text-gray-100 mb-6">Please wait while we confirm your account.</p>
            <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
      onClick={handleVerify}
    >
            <Lottie animationData={GlobeAnimation} loop={true} /></motion.div>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-5xl font-extrabold font-germania tracking-wider text-center text-shadow-DEFAULT text-emerald-700 dark:text-gray-100 mb-0">Email Verified!</h1>
            <p className="text-sm text-center text-shadow-glow text-green-500 dark:text-gray-100 mb-6">Your account is now active. Redirecting to login...</p>
            <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
      onClick={handleVerify}
    >
            <Lottie animationData={GlobeAnimation} loop={true} /></motion.div>
          </>
        )}

        {status === 'error' && (
  <>
    <h1 className="text-5xl font-extrabold font-germania tracking-wider text-center text-shadow-DEFAULT text-red-600 mb-0">
      Verification Failed
    </h1>
    <p className="text-sm text-center text-shadow-glow text-green-500 dark:text-gray-100 mb-6">
      Your verification link is invalid or has expired.
    </p>
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-32 mx-auto mt-1 mb-2 cursor-pointer"
      onClick={handleVerify}
    >
      <Lottie animationData={GlobeAnimation} loop={true} />
    </motion.div>

    <VerifyButton
      text="Try Again"
      onClick={() => navigate('/register')}
      className="w-full"
      colorConfig={{
        id: 'verifyError',
        baseColor: '#dc2626', // Tailwind red-600
        schemes: [
          'linear-gradient(145deg, #dc2626, #991b1b)',
          'linear-gradient(145deg, #ef4444, #b91c1c)',
        ],
      }}
    />
  </>
)}

      </div>
    </PageWrapper>
  </motion.div>
);

};

export default VerifyEmail;
