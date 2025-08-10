import API from 'api/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import Lottie from 'lottie-react';
import GlobeAnimation from 'animations/Globe.json';
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
const [success, setSuccess] = useState(
  sessionStorage.getItem('justVerified') ? 'Your email has been verified! Please login.' : ''
);
useEffect(() => {
  if (success) {
    sessionStorage.removeItem('justVerified');
  }
}, [success]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showResend, setShowResend] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');
  setShowResend(false);
await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    const { data } = await API.post('/auth/login', formData);

    setSuccess('Login Successful! 😎');
    setError('');

    // redirect delay
    setTimeout(() => navigate('/dashboard'), 1500);
  } catch (err) {
    console.error('❌ Login error:', err);
    if (err.response?.status === 403) {
      setError('Please verify your email. Didn’t get it?');
      setShowResend(true);
    } else if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError('❌ Something went wrong. Please try again.');
    }
  } finally {
    setLoading(false);
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
    <PageWrapper backgroundImage="/images/register-bk.webp">
      <div className={`${boxglow} flex items-center sm:space-x-1 sm:mb-2 mb-0`}>
        <div className="flex items-center ml-14 space-x-1"> <h1 className="text-5xl font-extrabold font-germania tracking-wider text-shadow-DEFAULT text-center text-emerald-700 dark:text-gray-100 mb-0" >Login</h1>

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

 {success && <p className="text-green-500 text-sm text-center animate-pulse mt-2 ">{success}</p>}
          {error && (
            <div className="flex flex-col items-center space-y-1 mb-2">
              <p className="text-red-600 text-sm text-center animate-bounce">{error}</p>
              {showResend && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await API.post('/auth/resend-verification', { email: formData.email });
                      setSuccess('Verification email resent! Please check your inbox.');
                      setError('');
                      setShowResend(false);
                    } catch (err) {
                      setError(err.response?.data?.error || 'Failed to resend email.');
                    }
                  }}
                  className="text-blue-500 text-xs underline hover:text-blue-700 transition"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`${inputBase} ${inputMail}`}
            required
            autoComplete="email"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`${inputBase} ${inputPass}`}
            required
            autoComplete="current-password"
          />
   <SubmitButton
              text="Login"
              loading={loading}
              success={success === 'Login successful!'} 
              disabled={loading}
            />

        </form>
      </div>
    </PageWrapper>
    </motion.div>
  );
};

export default Login;
