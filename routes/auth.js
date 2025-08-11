const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const authenticateToken = require('../middleware/authmiddleware');
const router = express.Router();

// email HTML Template
const emailHtml = (name, verificationLink) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0b0c2a url('https://i.ibb.co/xt6ccN5q/ivana-cajina-asuyh-ZX54-unsplash.jpg') no-repeat center center; background-size: cover; padding: 0; margin: 0; color: #ffffff;">

    <!-- Header -->
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>

    <!-- Main Content -->
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        max-width: 360px;
        margin: auto;
        padding: 20px 20px;
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.35);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(10px);
      ">
        <h2 style="font-size: 20px; margin: 0 0 10px; color: #e0e0e0;">Hey ${name} 👋</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">
          Welcome to <strong>Carbon Footprint Tracker</strong>!<br>Please verify your email to activate your account.
        </p>

        <!-- Globe GIF -->
        <img src="https://i.ibb.co/235Hgp1t/Globe.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />

        <!-- Button with shimmer effect (safe fallback for email clients) -->
        <a href="${verificationLink}" style="
          display: inline-block;
          background: linear-gradient(270deg, #2f80ed, #56ccf2);
          background-size: 400% 400%;
          color: white;
          padding: 12px 12px;
          font-size: 15px;
          font-weight: bold;
          text-decoration: none;
          border-radius: 28px;
          box-shadow: 0 0 16px rgba(255,255,255,0.2);
          animation: shimmer 2s infinite ease-in-out;
        ">
          ✅ Verify Email
        </a>

        <!-- Time & info -->
        <p style="font-size: 13px; margin-top: 20px; color: #e0e0e0;">
          Sent at: <strong>${new Date().toLocaleTimeString()}</strong><br>
          <span style="color: #FF4C4C;">Link expires in <strong>10 minutes</strong>.</span>
        </p>

        <p style="font-size: 11px; color: #999; margin-top: 8px;">
          Didn’t sign up? You can safely ignore this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">
      © 2025 Carbon Tracker • Carbon down. Future up.
    </div>

    <!-- Shimmer animation (safe for most modern clients as fallback styling) -->
    <style>
      @keyframes shimmer {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
    </style>
  </div>
`;

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already in use.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email, jti: Math.random().toString(36).substring(2) }, process.env.JWT_SECRET, { expiresIn: '10m' });

    const newUser = new User({
      name,
      email,
      passwordHash,
      verificationToken,
      isVerified: false,
    });
    await newUser.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail(email, 'Verify your Carbon Footprint Tracker account', emailHtml(name, verificationLink));

    res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'None',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    }).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
      },
      token
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /me (auth check via cookie)
router.get('/token-info/me', async (req, res) => {
  try {
    const token = req.cookies.token || req.query.token;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: new RegExp(`^${decoded.email}$`, 'i') });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      verified: user.isVerified,
    });
  } catch (err) {
    console.error('❌ /me error:', err);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// LOGOUT (clear cookie)
router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'Strict' : 'Lax',
  });

  res.json({ message: 'Logged out successfully' });
});

// VERIFY EMAIL
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email, verificationToken: token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error('❌ Email verification error:', err);
    res.status(400).json({ error: 'Email verification failed or token expired' });
  }
});

// RESEND VERIFICATION
const resendCooldown = new Map(); // email -> timestamp
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const now = Date.now();

    if (resendCooldown.has(email) && now - resendCooldown.get(email) < 3 * 60 * 1000) {
      return res.status(429).json({ error: 'Please wait 3 minutes before requesting again.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Account already verified.' });

    const verificationToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    user.verificationToken = verificationToken;
    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail(user.email, 'Verify your Carbon Tracker account', emailHtml(user.name, verificationLink));

    resendCooldown.set(email, now);
    res.status(200).json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (err) {
    console.error('❌ Resend verification error:', err);
    res.status(500).json({ error: 'Server error while resending verification.' });
  }
});

module.exports = router;
