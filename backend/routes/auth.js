const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
const emailHtml = (name, verificationLink) => `
   <div style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 0; margin: 0;">
    <div style="background: linear-gradient(to right, #56ccf2, #2f80ed); padding: 20px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 28px;">🌍 Carbon Footprint Tracker</h1>
    </div>

    <div style="background: url('https://unsplash.com/photos/an-artists-impression-of-a-black-hole-in-the-sky-1c2iHG5_MgE') no-repeat center center; background-size: cover; padding: 40px 20px; text-align: center;">
      <div style="background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 12px; max-width: 500px; margin: auto;">
        <h2 style="color: #333; font-size: 22px;">Hello ${name},</h2>
        <p style="color: #555; font-size: 16px;">Welcome to Carbon Footprint Tracker! Please verify your email address to activate your account.</p>

        <a href="${verificationLink}" style="display: inline-block; background-color: #2f80ed; color: white; padding: 14px 28px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          Verify Email
        </a>

        <p style="color: #777; font-size: 14px;">This link will expire in 24 hours. If you did not sign up, you can ignore this email.</p>
      </div>
    </div>

    <div style="background: #2f80ed; padding: 10px; text-align: center; color: white; font-size: 14px;">
      © 2025 Carbon Tracker • Carbon down. Future up.
    </div>
  </div>
`;



router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create email verification token
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const newUser = new User({
      name,
      email,
      passwordHash,
      verificationToken,
      isVerified: false
    });
    await newUser.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendEmail(
      email,
      'Verify your Carbon Footprint Tracker account',
      emailHtml(name, verificationLink)
    );

    return res.status(201).json({
      message: 'User registered. Please check your email to verify your account.'
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // false for localhost
      sameSite: 'Strict',
      maxAge: 4 * 24 * 60 * 60 * 1000 // 4 days
    }).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user's email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email, verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error('❌ Email verification error:', err);
    res.status(400).json({ error: 'Email verification failed or token expired' });
  }
});
// @route POST /api/auth/resend-verification
// @desc Resend verification email
// Track resend timestamps in memory (simple)
const resendCooldown = new Map(); // email -> timestamp

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const now = Date.now();

    // Check cooldown (3 minute)
    if (resendCooldown.has(email) && now - resendCooldown.get(email) < 3 * 60 * 1000) {
      return res.status(429).json({ error: 'Please wait 3 minutes before requesting again.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Account already verified.' });

    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    user.verificationToken = verificationToken;
    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail(
      user.email,
      'Verify your Carbon Tracker account',
      emailHtml(user.name, verificationLink)
    );

    // Save cooldown timestamp
    resendCooldown.set(email, now);

    res.status(200).json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (err) {
    console.error('❌ Resend verification error:', err);
    res.status(500).json({ error: 'Server error while resending verification.' });
  }
});

router.get('/token-info/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ name: user.name });
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

module.exports = router;
