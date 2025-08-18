import API from 'api/api';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
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
    setError('Please enter a valid email address.');
    return;
  }

  if (passwordStrength !== null && passwordStrength < 2) {
    setError('Password is too weak. Use a mix of letters, numbers, and symbols.');
    return;
  }

  setLoading(true);
  setDelayMessage('');
await new Promise((resolve) => setTimeout(resolve, 400));
  try {
    await API.post('/auth/register', {
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
timers.current = [
      setTimeout(() => setDelayMessage('Thanks for your patience... ✨'), 10000),
      setTimeout(() => setDelayMessage('Just a bit longer! ⏳'), 20000),
      setTimeout(() => setDelayMessage('The server is waking up and can take upto a minute...🙂'), 30000),
      setTimeout(() => setDelayMessage('Almost there...'), 40000),
    ];
    timers.current.forEach((t) => clearTimeout(t));
    setDelayMessage('');
    setSuccess('🎉 Registration successful! Please check your email and click the link to verify your account.');
    setError('');
    setFormData({ name: '', email: '', password: '' });
    setPasswordStrength(null);

    setTimeout(() => navigate('/login'), 2500);
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
        <h1 className="text-5xl font-extrabold font-germania tracking-wider text-shadow-DEFAULT text-center text-emerald-700 dark:text-gray-100 mb-0">Track. Reduce. Inspire</h1>
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
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`${inputBase} ${inputPass}`}
            required
            autoComplete="new-password"
            title="Just for this app"
          />
            {passwordStrength !== null && (
              <div className="text-sm text-center mb-2">
                <p>Password strength: <span className={
                  passwordStrength < 2 ? 'text-red-500' :
                  passwordStrength === 2 ? 'text-yellow-500' :
                  'text-green-500'
                }>
                  {strengthLabel[passwordStrength]}
                </span></p>
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
