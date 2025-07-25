import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from 'api/api';
import { motion } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import { boxglow, heading, subheading } from 'utils/styles';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [userName, setUserName] = useState('');

  // Fetch username associated with the token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get(`/auth/token-info/${token}`);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="w-full h-full"
    >
      <PageWrapper backgroundImage="/images/register-bk.webp">
        <div className={`${boxglow} text-center max-w-md`}>
          {status === 'idle' && (
            <>
              <h1 className={heading}>Hello {userName || 'User'}!</h1>
              <p className={subheading}>Click the button below to verify your email.</p>
              <button
                onClick={handleVerify}
                className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center"
              >
                {status === 'verifying' ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : null}
                {status === 'verifying' ? 'Verifying...' : 'Verify Email'}
              </button>
            </>
          )}

          {status === 'verifying' && (
            <>
              <h1 className={heading}>Verifying your email...</h1>
              <p className={subheading}>Please wait while we confirm your account.</p>
              <div className="animate-spin mt-4 text-4xl">🌍</div>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className={`${heading} text-green-500`}>Email Verified!</h1>
              <p className={subheading}>Your account is now active. Redirecting to login...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className={`${heading} text-red-500`}>Verification Failed</h1>
              <p className={subheading}>Your verification link is invalid or has expired.</p>
              <button
                onClick={() => navigate('/register')}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
              >
                Go to Register
              </button>
            </>
          )}
        </div>
      </PageWrapper>
    </motion.div>
  );
};

export default VerifyEmail;
