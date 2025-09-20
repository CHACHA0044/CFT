const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const axios = require('axios');
const authenticateToken = require('../middleware/authmiddleware');
const router = express.Router();
const crypto = require('crypto');
// email HTML Template
const formatTime = (date = new Date(), timeZone = "Asia/Kolkata") => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).format(date);
  } catch {
    // Fallback: manually add +05:30 to UTC
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const ist = new Date(utcMs + 330 * 60000); // 330 minutes = 5.5 hours
    const h = ist.getHours();
    const m = ist.getMinutes();
    const mer = h >= 12 ? "PM" : "AM";
    const hour12 = ((h + 11) % 12) + 1;
    const mm = String(m).padStart(2, "0");
    return `${hour12}:${mm} ${mer}`;
  }
};

const emailHtml = (name, verificationLink, { timeZone = "Asia/Kolkata" } = {}) => {
  const currentTime = formatTime(new Date(), timeZone);

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">

    <!-- Header -->
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>

    <!-- Main Content -->
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="
        background: rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        max-width: 360px;
        margin: auto;
        padding: 24px 20px;
        box-shadow: 0 0 22px rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      ">
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #e0e0e0;">Hello👋, ${name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">
          Welcome to <strong>Carbon Footprint Tracker</strong>!<br>Please verify your email to activate your account.
        </p>

        <!-- Globe GIF -->
        <img src="https://i.ibb.co/hRS5TrsN/Globe.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />

        <!-- Button (email-safe styling) -->
        <a href="${verificationLink}" style="
          display: inline-block;
          background: linear-gradient(90deg, #2f80ed, #56ccf2);
          color: #ffffff;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: bold;
          text-decoration: none;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 0 18px rgba(47,128,237,0.35);
        ">
          ✅ Verify Email
        </a>

        <!-- Time & info -->
        <p style="font-size: 13px; margin-top: 20px; color: #e0e0e0;">
          Sent at: <strong>${currentTime}</strong><br>
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
  </div>
  `;
};

const feedbackReplyHtml = (name, { timeZone = "Asia/Kolkata" } = {}) => {
  const currentTime = formatTime(new Date(), timeZone);

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">

    <!-- Header -->
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>

    <!-- Main Content -->
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="
        background: rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        max-width: 360px;
        margin: auto;
        padding: 24px 20px;
        box-shadow: 0 0 22px rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      ">
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #e0e0e0;">Hello👋, ${name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">
          Thank you for sharing your valuable feedback with us ✨<br/>
          We truly appreciate the time you took to help us improve <strong>Carbon Footprint Tracker</strong>.
        </p>

        <!-- Globe GIF -->
        <img src="https://i.ibb.co/235Hgp1t/Globe.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />

        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">
          Our team will carefully review your suggestions and work on making the platform better for you and the community.
        </p>

        <!-- Time Info -->
        <p style="font-size: 13px; margin-top: 20px; color: #e0e0e0;">
          Sent at: <strong>${currentTime}</strong>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">
      © 2025 Carbon Tracker • Thanks for helping us improve 🌱
    </div>
  </div>
  `;
};

// FEEDBACK 
router.post('/feedback/resend-thankyou', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.email) return res.status(400).json({ error: "User email not found." });

    try {
      await sendEmail(
        user.email,
        "Thanks for your feedback ✨",
        feedbackReplyHtml(user.name, { timeZone: "Asia/Kolkata" })
      );
      console.log(`✅ Thank-you email resent to ${user.email}`);
      return res.json({ message: "Thank-you email resent successfully." });
    } catch (err) {
      console.error(`❌ Failed to resend thank-you email to ${user.email}:`, err);
      return res.status(500).json({ error: "Failed to resend thank-you email." });
    }

  } catch (err) {
    console.error("❌ Resend thank-you route error:", err);
    res.status(500).json({ error: "Server error while resending thank-you email." });
  }
});

// SUBMIT FEEDBACK 
router.post('/feedback/submit', authenticateToken, async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ error: "Feedback message is required." });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.email) return res.status(400).json({ error: "User email not found." });

    console.log(`📝 Feedback received from ${user.email}: ${feedback}`);

    try {
      await sendEmail(
        user.email,
        "Thanks for your feedback ✨",
        feedbackReplyHtml(user.name, { timeZone: "Asia/Kolkata" })
      );
      console.log(`✅ Thank-you email sent to ${user.email}`);
      
      return res.json({ 
        message: "Feedback submitted successfully! Thank-you email sent.",
        feedbackReceived: true 
      });
    } catch (emailError) {
      console.error(`❌ Failed to send thank-you email to ${user.email}:`, emailError);
      return res.json({ 
        message: "Feedback submitted successfully, but thank-you email failed to send.",
        feedbackReceived: true,
        emailSent: false 
      });
    }

  } catch (err) {
    console.error("❌ Feedback submission error:", err);
    res.status(500).json({ error: "Server error while submitting feedback." });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already in use.' });

    const passwordHash = await bcrypt.hash(password, 12);
    //const verificationToken = jwt.sign({ email, jti: Math.random().toString(36).substring(2) }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const verificationToken = jwt.sign({ email, jti: crypto.randomBytes(16).toString('hex')},  process.env.JWT_SECRET,  { expiresIn: '10m' });
    const newUser = new User({
      name,
      email,
      passwordHash,
      verificationToken,
      isVerified: false,
      resendAttempts: 0,        
      lastResendAt: Date.now(), 
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

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'None',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    }).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /me (auth check via cookie)
router.get('/token-info/me', async (req, res) => {
  try {
    let token = req.cookies.token || req.query.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
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
    sameSite: 'None',
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
    user.resendAttempts = undefined;
    user.lastResendAt = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error('❌ Email verification error:', err);
    res.status(400).json({ error: 'Email verification failed or token expired' });
  }
});

// RESEND VERIFICATION
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Account already verified.' });

    const now = Date.now();
    if (!user.lastResendAt || now - user.lastResendAt > 24 * 60 * 60 * 1000) {
      user.resendAttempts = 0;
    }

    if (user.resendAttempts >= 4) {
      return res.status(429).json({ error: 'Resend limit reached.' });
    }
   
    // const verificationToken = jwt.sign(
    //   { email: user.email },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '10m' }
    // );
    const verificationToken = jwt.sign( { email, jti: crypto.randomBytes(16).toString('hex') }, process.env.JWT_SECRET, { expiresIn: '10m' });

    user.verificationToken = verificationToken;
    user.resendAttempts += 1;
    user.lastResendAt = now;
    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail(user.email, 'Verify your Carbon Tracker account', emailHtml(user.name, verificationLink));

    res.status(200).json({ message: 'Verification email resent. Please check your inbox.' });

  } catch (err) {
    console.error('❌ Resend verification error:', err);
    res.status(500).json({ error: 'Server error while resending verification.' });
  }
});

// WAKEUP SON 
router.get('/ping', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Content-Type': 'application/json'
  });
  
  res.status(200).json({ 
    message: 'Server server wake up!',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// WEATHER & AQI
router.get("/weather-aqi", async (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Content-Type': 'application/json'
  });

  let { lat, lon } = req.query;

  try {
    if (!lat || !lon) {
      const ipRes = await axios.get("https://ipapi.co/json/");
      lat = ipRes.data.latitude;
      lon = ipRes.data.longitude;
    }

    // Weather 
    const weatherRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,windspeed_10m,weather_code,apparent_temperature`
  );

    // Air Quality 
    const airRes = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,ozone,nitrogen_dioxide,sulphur_dioxide,uv_index`
    );

    res.json({
      weather: weatherRes.data.current,
      air_quality: airRes.data.current,
      location_source: req.query.lat && req.query.lon ? "browser" : "ip",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
