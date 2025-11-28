const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const axios = require('axios');
const authenticateToken = require('../middleware/authmiddleware');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const redisClient = require('../RedisClient');
const passport = require('../config/passport');

// HELPER FUNCTIONS
const formatTime = (date = new Date(), timeZone = "Asia/Kolkata") => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).format(date);
  } catch {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const ist = new Date(utcMs + 330 * 60000);
    const h = ist.getHours();
    const m = ist.getMinutes();
    const mer = h >= 12 ? "PM" : "AM";
    const hour12 = ((h + 11) % 12) + 1;
    const mm = String(m).padStart(2, "0");
    return `${hour12}:${mm} ${mer}`;
  }
};

const formatDate = (date, timeZone = "Asia/Kolkata") => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const emailHtml = (name, verificationLink, { timeZone = "Asia/Kolkata" } = {}) => {
  const currentTime = formatTime(new Date(), timeZone);
  const currentDate = formatDate(new Date(), timeZone);
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="background: rgba(255, 255, 255, 0.08); border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.15); max-width: 360px; margin: auto; padding: 24px 20px; box-shadow: 0 0 22px rgba(255, 255, 255, 0.18); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #e0e0e0;">Hello👋, ${name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">Welcome to <strong>Carbon Footprint Tracker</strong>!<br>Please verify your email to activate your account.</p>
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />
        <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(90deg, #2f80ed, #56ccf2); color: #ffffff; padding: 14px 20px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 30px; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 0 18px rgba(47,128,237,0.35);">✅ Verify Email</a>
        <p style="font-size: 13px; margin-top: 20px; color: #e0e0e0;">Sent at: <strong>${currentTime}</strong> on <strong>${currentDate}</strong><br><span style="color: #FF4C4C;">Link expires in <strong>10 minutes</strong>!</span></p>
        <p style="font-size: 11px; color: #999; margin-top: 8px;">Didn't sign up? You can safely ignore this email.</p>
      </div>
    </div>
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">© 2025 Carbon Tracker • Carbon down. Future up.</div>
  </div>`;
};

const welcomeEmailHtml = (name) => {
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="background: rgba(255, 255, 255, 0.08); border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.15); max-width: 360px; margin: auto; padding: 24px 20px; box-shadow: 0 0 22px rgba(255, 255, 255, 0.18); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #e0e0e0;">Hello👋, ${name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">Welcome to <strong>Carbon Footprint Tracker</strong>!<br></p>
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />
         <p style="font-size: 16px; color: #e0e0e0;">
      Welcome aboard! <strong>Carbon Footprint Tracker (CFT)</strong> helps you track and reduce your environmental impact. 
      Log your monthly data on <strong>food, transport, electricity,</strong> and <strong>waste</strong>, get <strong>personalized reduction tips</strong>, 
      and see how you rank on the community leaderboard.
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      Built for simplicity and accuracy, CFT combines clean design, secure authentication, and interactive visuals — 
      making climate action easy, insightful, and motivating.
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      Let’s take a step toward a greener future — one entry at a time 🌱
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      <strong>Start exploring:</strong> 
      <a href="https://cft-self.vercel.app" style="color: #1d4ed8; text-decoration: none;">CFT</a>
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      We’d love to hear about your experience! Feel free to reach out at:
  <a 
  href="https://mail.google.com/mail/?view=cm&fs=1&to=carbontracker.noreply@gmail.com&su=Feedback%20on%20Carbon%20Footprint%20Tracker"
  target="_blank"
  style="color: #3A7BD5; text-decoration: underline;"
>
  carbontracker.noreply@gmail.com
</a>


    </p>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      — Regards<br/>
      <a href="https://github.com/CHACHA0044/CFT" style="color: #1d4ed8; text-decoration: none;">Pranav</a>
    </p>
    </div>
    </div>
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">© 2025 Carbon Tracker • Carbon down. Future up.</div>
  </div>`;
};

const feedbackReplyHtml = (name, { timeZone = "Asia/Kolkata" } = {}) => {

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="background: rgba(255, 255, 255, 0.08); border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.15); max-width: 360px; margin: auto; padding: 24px 20px; box-shadow: 0 0 22px rgba(255, 255, 255, 0.18); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #e0e0e0;">Hello👋, ${name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">Thank you for sharing your valuable feedback with us ✨<br/>We truly appreciate the time you took to help us improve <strong>Carbon Footprint Tracker</strong>.</p>
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">Our team will carefully review your suggestions and work on making the platform better for you and the community.</p>
        
      </div>
    </div>
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">© 2025 Carbon Tracker • Thanks for helping us improve 🌱</div>
  </div>`;
};

const welcomeEmailHtmlG = (name, passwordLink, { timeZone = "Asia/Kolkata" } = {} ) => {
  const currentTime = formatTime(new Date(), timeZone);
  const currentDate = formatDate(new Date(), timeZone);
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="background: rgba(255, 255, 255, 0.08); border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.15); max-width: 360px; margin: auto; padding: 24px 20px; box-shadow: 0 0 22px rgba(255, 255, 255, 0.18); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #e0e0e0;">Hello👋, ${name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">Welcome to <strong>Carbon Footprint Tracker</strong>!<br></p>
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />
         <p style="font-size: 16px; color: #e0e0e0;">
      Welcome aboard! <strong>Carbon Footprint Tracker (CFT)</strong> helps you track and reduce your environmental impact. 
      Log your monthly data on <strong>food, transport, electricity,</strong> and <strong>waste</strong>, get <strong>personalized reduction tips</strong>, 
      and see how you rank on the community leaderboard.
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      Built for simplicity and accuracy, CFT combines clean design, secure authentication, and interactive visuals — 
      making climate action easy, insightful, and motivating.
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      Let’s take a step toward a greener future — one entry at a time 🌱
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
    You can login using your email(or google as u just did) along with the following password:<br />
    <a href="${passwordLink}" style="display: inline-block; background: linear-gradient(90deg, #2f80ed, #56ccf2); margin-top: 20px; color: #ffffff; padding: 14px 20px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 30px; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 0 18px rgba(47,128,237,0.35);">Password</a>
    <p style="font-size: 13px; margin-top: 20px; color: #e0e0e0;">Sent at: <strong>${currentTime}</strong> on <strong>${currentDate}</strong><br><span style="color: #FF4C4C;">Link expires in <strong>3 Days</strong>!</span></p>
   </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      <strong>Start exploring:</strong> 
      <a href="https://cft-self.vercel.app" style="color: #1d4ed8; text-decoration: none;">CFT</a>
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      We’d love to hear about your experience! Feel free to reach out at:
  <a 
  href="https://mail.google.com/mail/?view=cm&fs=1&to=carbontracker.noreply@gmail.com&su=Feedback%20on%20Carbon%20Footprint%20Tracker"
  target="_blank"
  style="color: #3A7BD5; text-decoration: underline;"
>
  carbontracker.noreply@gmail.com
</a>


    </p>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      — Regards<br/>
      <a href="https://github.com/CHACHA0044/CFT" style="color: #1d4ed8; text-decoration: none;">Pranav</a>
    </p>
    </div>
    </div>
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">© 2025 Carbon Tracker • Carbon down. Future up.</div>
  </div>`;
};

const getCachedData = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (data) {
      const ttl = await redisClient.ttl(key);
    //  console.log(` [REDIS CACHE HIT] Key: ${key} | TTL: ${ttl}s`);
      return { data: JSON.parse(data), ttl };
    }
    //console.log(`[REDIS CACHE MISS] Key: ${key}`);
    return null;
  } catch (err) {
   // console.error(`[REDIS READ ERROR] Key: ${key} | Error:`, err.message);
    return null;
  }
};

const setCachedData = async (key, data, ttl) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
   // console.log(`[REDIS CACHE SET] Key: ${key} | TTL: ${ttl}s | Size: ${JSON.stringify(data).length} bytes`);
    return true;
  } catch (err) {
   // console.error(`[REDIS WRITE ERROR] Key: ${key} | Error:`, err.message);
    return false;
  }
};

const getRateLimitData = async (key) => {
  try {
    const count = await redisClient.get(key);
    const ttl = count ? await redisClient.ttl(key) : -1;
   // console.log(`[REDIS RATE LIMIT CHECK] Key: ${key} | Count: ${count || 0} | TTL: ${ttl}s`);
    return { count: count ? parseInt(count) : 0, ttl };
  } catch (err) {
   // console.error(`[REDIS RATE LIMIT ERROR] Key: ${key} | Error:`, err.message);
    return { count: 0, ttl: -1 };
  }
};

const incrementRateLimit = async (key, ttl) => {
  try {
    const current = await redisClient.get(key);
    if (current) {
      await redisClient.incr(key);
     // console.log(`[REDIS RATE LIMIT INCREMENT] Key: ${key} | New Count: ${parseInt(current) + 1}`);
    } else {
      await redisClient.setEx(key, ttl, '1');
     // console.log(` [REDIS RATE LIMIT NEW] Key: ${key} | TTL: ${ttl}s`);
    }
    return true;
  } catch (err) {
    //console.error(`[REDIS RATE LIMIT INCREMENT ERROR] Key: ${key} | Error:`, err.message);
    return false;
  }
};

const deleteKey = async (key) => {
  try {
    await redisClient.del(key);
    //console.log(` [REDIS DELETE] Key: ${key}`);
    return true;
  } catch (err) {
    //console.error(` [REDIS DELETE ERROR] Key: ${key} | Error:`, err.message);
    return false;
  }
};

//GETME
router.get('/token-info/me', async (req, res) => {
  const startTime = Date.now();
  console.log('\n🔐 [/token-info/me] Request received');

  try {
    // Extract token
    let token = req.cookies.token || req.query.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      console.log('❌ [AUTH] No token provided');
      return res.status(401).json({ error: 'Missing token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ [JWT] Token verified for userId: ${decoded.userId}`);

    const cacheKey = `user:profile:${decoded.userId}`;
    
    // Try cache first
    const cached = await getCachedData(cacheKey);
    if (cached) {
      const responseTime = Date.now() - startTime;
      console.log(`⚡ [RESPONSE] Sent from cache in ${responseTime}ms`);
      return res.json({
        ...cached.data,
        fromCache: true,
        cacheTTL: cached.ttl,
        responseTime: `${responseTime}ms`
      });
    }

    // Fetch from database
    console.log(`🔍 [DATABASE] Fetching user from MongoDB...`);
    const dbStartTime = Date.now();
    
    const user = await User.findById(decoded.userId).select('name email isVerified');
    
    const dbTime = Date.now() - dbStartTime;
    console.log(`📊 [DATABASE] Query completed in ${dbTime}ms`);

    if (!user) {
      console.log(`❌ [DATABASE] User not found: ${decoded.userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      name: user.name,
      email: user.email,
      verified: user.isVerified,
    };

    // Cache for 30 minutes (1800 seconds)
    const cacheTTL = 1800;
    await setCachedData(cacheKey, userData, cacheTTL);

    const responseTime = Date.now() - startTime;
    console.log(`✅ [RESPONSE] Sent from database in ${responseTime}ms`);
    
    res.json({
      ...userData,
      fromCache: false,
      cacheTTL,
      responseTime: `${responseTime}ms`,
      dbQueryTime: `${dbTime}ms`
    });

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      console.error('❌ [JWT ERROR] Invalid token:', err.message);
      return res.status(400).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      console.error('❌ [JWT ERROR] Token expired:', err.message);
      return res.status(400).json({ error: 'Token expired' });
    }
    console.error('❌ [SERVER ERROR] /me route error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//LOGIN
router.post('/login', async (req, res) => {
  console.log(' [/login] Login attempt started');
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log(' [VALIDATION] Missing email or password');
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    console.log(` [LOGIN] Attempt for email: ${email}`);

    // Check rate limit
    const loginAttemptKey = `login:attempts:${email}`;
    const rateLimit = await getRateLimitData(loginAttemptKey);
    
    if (rateLimit.count >= 5) {
      console.log(` [RATE LIMIT] Login blocked for ${email}`);
      return res.status(429).json({ 
        error: 'Too many login attempts. Please try again later.',
        retryAfter: rateLimit.ttl,
        attemptsRemaining: 0
      });
    }

    // Find user (cache this query)
    const userCacheKey = `user:auth:${email}`;
    let user;
    
    const cached = await getCachedData(userCacheKey);
    if (cached) {
      console.log(`[CACHE] User data from cache`);
      // Still need to fetch from DB to verify current state
      user = await User.findById(cached.data.userId);
    } else {
      console.log(`[DATABASE] Looking up user: ${email}`);
      user = await User.findOne({ email });
      
      // Cache user lookup for 5 minutes
      if (user) {
        await setCachedData(userCacheKey, { userId: user._id }, 300);
      }
    }
    
    if (!user) {
      console.log(`[AUTH] User not found: ${email}`);
      await incrementRateLimit(loginAttemptKey, 900);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Rest of your password verification logic...
    console.log(` [AUTH] Verifying password...`);
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      console.log(` [AUTH] Invalid password for: ${email}`);
      await incrementRateLimit(loginAttemptKey, 900);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      console.log(` [AUTH] Unverified account: ${email}`);
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    // Clear failed attempts
    await deleteKey(loginAttemptKey);
    console.log(` [RATE LIMIT] Cleared failed attempts for: ${email}`);

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '3d' }
    );
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,           // true in prod
      sameSite: isProd ? 'None' : 'Lax',  // None for cross-origin in prod
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    console.log(` [LOGIN SUCCESS] User logged in: ${email} | From cache: ${!!cached}`);
     // WELCOME EMAIL ON FIRST LOGIN (for local users only)
    if (user.provider === 'local' && !user.welcomeEmailSent) {
      // email after a delay to avoid Gmail spam filters
      setTimeout(async () => {
        try {
          console.log(`[1st] Sending welcome email to: ${email}`);
          
          await sendEmail(
            user.email,
            '🎉 Welcome to Your Carbon Journey!',
            welcomeEmailHtml(user.name)
          );
          
          // Update the welcomeEmailSent flag
          await User.findByIdAndUpdate(user._id, { welcomeEmailSent: true });
          
          console.log(`[1st]Welcome email sent successfully to: ${email}`);
        } catch (emailError) {
          console.error(`❌ [1st] Failed to send to ${email}:`, emailError.message);
          // not blocking login if email fails
        }
      }, 10000); // 10 second delay - user will be on dashboard by then
    } else if (user.provider === 'local') {
      console.log(`ℹ️ [LOGIN] Welcome email already sent to: ${email}`);
    }
    res.json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error('❌ [SERVER ERROR] Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

//LOGOUTT
router.post('/logout', authenticateToken, async (req, res) => {
  console.log('\n🚪 [/logout] Logout request received');
  
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.decode(token);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      
      if (ttl > 0) {
        const blacklistKey = `blacklist:token:${token}`;
        // blacklisting token when user logs out,storing it in Redis with a TTL equal to its remaining lifetime...prevents reuse of that JWT even before its natural expiry
        await setCachedData(blacklistKey, { invalidated: true }, ttl);
        console.log(`🔒 [TOKEN BLACKLIST] Token invalidated | TTL: ${ttl}s`);
      }

      if (req.user?.userId) {
        const userCacheKey = `user:profile:${req.user.userId}`;
        await deleteKey(userCacheKey);
        console.log(`🗑️ [CACHE] User cache invalidated: ${userCacheKey}`);
      }
    }

    const isProd = process.env.NODE_ENV === 'production';
    
     res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
    });

    console.log(`✅ [LOGOUT SUCCESS]`);
    res.json({ message: 'Logged out successfully' });

  } catch (err) {
    console.error('❌ [SERVER ERROR] Logout error:', err);
    res.status(500).json({ error: 'Server error during logout.' });
  }
});

//FEEDBACK SUBMISSION RECORD OF EVERY USER
router.post('/feedback/submit', authenticateToken, async (req, res) => {
  console.log('\n📝 [/feedback/submit] Feedback submission started');
  
  try {
    const { feedback } = req.body;
    
    if (!feedback || feedback.trim() === '') {
      console.log('❌ [VALIDATION] Empty feedback message');
      return res.status(400).json({ error: "Feedback message is required." });
    }

    // Rate limit: 3 submissions per hour
    const feedbackRateKey = `feedback:submissions:${req.user.userId}`;
    const rateLimit = await getRateLimitData(feedbackRateKey);
    
    if (rateLimit.count >= 3) {
      console.log(`🚫 [RATE LIMIT] Feedback blocked for userId: ${req.user.userId} | Submissions: ${rateLimit.count}`);
      return res.status(429).json({ 
        error: 'You can only submit 3 feedbacks per hour.',
        retryAfter: rateLimit.ttl
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`❌ [DATABASE] User not found: ${req.user.userId}`);
      return res.status(404).json({ error: "User not found." });
    }

    console.log(`📝 [FEEDBACK] Received from ${user.email}: ${feedback.substring(0, 50)}...`);

    // ✅ Increment rate limit counter FIRST
    await incrementRateLimit(feedbackRateKey, 3600);

    // ✅ Then update database
    user.feedbackGiven = true;
    await user.save();
    console.log(`✅ [DATABASE] feedbackGiven set to true for: ${user.email}`);

    // Send thank you email (non-blocking)
    try {
      await sendEmail(
        user.email,
        "Thanks for your feedback ✨",
        feedbackReplyHtml(user.name, { timeZone: "Asia/Kolkata" })
      );
      console.log(`✅ [EMAIL] Thank-you email sent to: ${user.email}`);
      
      return res.json({ 
        message: "Feedback submitted successfully! Thank-you email sent.",
        feedbackReceived: true,
        emailSent: true
      });
    } catch (emailError) {
      console.error(`❌ [EMAIL ERROR] Failed to send to ${user.email}:`, emailError.message);
      
      // Even if email fails, feedback was recorded
      return res.json({ 
        message: "Feedback submitted successfully, but thank-you email failed to send.",
        feedbackReceived: true,
        emailSent: false 
      });
    }

  } catch (err) {
    console.error("❌ [SERVER ERROR] Feedback submission error:", err);
    res.status(500).json({ error: "Server error while submitting feedback." });
  }
});

//THANKS MY G
router.post('/feedback/resend-thankyou', authenticateToken, async (req, res) => {
  console.log('\n📧 [/feedback/resend-thankyou] Resend request received');
  
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!user.email) return res.status(400).json({ error: "User email not found." });

    await sendEmail(
      user.email,
      "Thanks for your feedback ✨",
      feedbackReplyHtml(user.name, { timeZone: "Asia/Kolkata" })
    );
    
    console.log(`✅ [EMAIL] Thank-you email resent to: ${user.email}`);
    return res.json({ message: "Thank-you email resent successfully." });

  } catch (err) {
    console.error("❌ [SERVER ERROR] Resend thank-you error:", err);
    res.status(500).json({ error: "Server error while resending thank-you email." });
  }
});

//REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already in use.' });

    const passwordHash = await bcrypt.hash(password, 12);
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

//VERIFYROUTE
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log('🔍 [VERIFY] Token received');
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ [VERIFY] Token decoded for email:', decoded.email);
    } catch (jwtErr) {
      console.error('❌ [VERIFY] JWT error:', jwtErr.message);
      return res.status(400).json({ 
        error: 'Invalid or expired verification link',
        expired: jwtErr.name === 'TokenExpiredError'
      });
    }

    const user = await User.findOne({ 
      email: decoded.email,
      verificationToken: token 
    });
    
    if (!user) {
      console.error('❌ [VERIFY] User not found or token mismatch');
      return res.status(400).json({ 
        error: 'Invalid or expired verification link' 
      });
    }

    // Check if already verified (to prevent duplicate welcome emails)
    if (user.isVerified) {
      console.log('⚠️ [VERIFY] User already verified:', user.email);
      return res.status(200).json({ 
        message: 'Email already verified!',
        user: {
          name: user.name,
          email: user.email
        },
        alreadyVerified: true
      });
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.resendAttempts = undefined;
    user.lastResendAt = undefined;
    await user.save();

    console.log('✅ [VERIFY] Email verified for:', user.email);
    
    // Send welcome email with better error handling
    let welcomeEmailStatus = 'not_sent';
    try {
      await sendEmail(
        user.email,
        'Welcome to Carbon Footprint Tracker! 🌍',
        welcomeEmailHtml(user.name)
      );
      
      welcomeEmailStatus = 'sent';
      console.log('✅ [EMAIL] Welcome email sent successfully to:', user.email);
    } catch (emailError) {
      welcomeEmailStatus = 'failed';
      console.error('❌ [EMAIL ERROR] Failed to send welcome email to', user.email);
      console.error('Error details:', emailError.message);
      // Verification still succeeds even if welcome email fails
    }
    
    // Return success regardless of welcome email status
    res.status(200).json({ 
      message: 'Email verified successfully!',
      user: {
        name: user.name,
        email: user.email
      },
      welcomeEmailSent: welcomeEmailStatus === 'sent'
    });
    
  } catch (err) {
    console.error('❌ [VERIFY] Server error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

//USERNAME FROM EMAIL
router.get('/verify-email/:token/preview', async (req, res) => {
  try {
    const { token } = req.params;
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(400).json({ 
        error: 'Invalid or expired token',
        expired: jwtErr.name === 'TokenExpiredError'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: decoded.email }).select('name email');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // returnin the name
    res.json({ 
      name: user.name,
      email: user.email
    });
    
  } catch (err) {
    console.error('❌ [PREVIEW] Error:', err);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

//RESEND VERIFICATION EMAIL
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
router.get('/ping', async (req, res) => {
  //setting headers for cors issues so tht fe can call this endpoint across domains
  res.set({
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Content-Type': 'application/json'
  });

  try {
    // Lightweight CPU work (dummy hash calc)
    const sum = Array.from({ length: 1000 }, (_, i) => Math.sqrt(i * Math.random())).reduce((a, b) => a + b, 0);

    // Lightweight Redis operation, incr is a redis command that automatically creates pinghit adn increments it, then return incremented value
    const hits = await redisClient.incr('ping_hits');

    // MDB checking 
    const mongooseStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const readableTime = formatTime(new Date(), "Asia/Kolkata");
    res.status(200).json({
      message: `Server is awake and did 14,000,605 calculations...${readableTime}`,
      cpuSample: sum.toFixed(2),
      redisHits: hits,
      mongo: mongooseStatus,
      timestamp: readableTime,
      status: 'healthy'
    });
  } catch (err) {
    console.error('❌ Ping error:', err);
    res.status(500).json({ error: 'Ping failed', details: err.message });
  }
});

// WEATHER & AQI
router.get("/weather-aqi", async (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
    "Content-Type": "application/json",
  });

  let { lat, lon, refresh, forceApi } = req.query;
  //console.log("📥 Query Params:", { lat, lon, refresh, forceApi });
  
  try {
    // Get location from IP if missing
    if (!lat || !lon) {
      const ipRes = await axios.get("https://ipapi.co/json/");
      //console.log("🌐 IP Location fetched:", ipRes.data);
      lat = ipRes.data.latitude;
      lon = ipRes.data.longitude;
    }
    //rounding coordinates to prevent cache key fragmentation
    lat = parseFloat(parseFloat(lat).toFixed(4));
    lon = parseFloat(parseFloat(lon).toFixed(4));

    const cacheKey = `weather:${lat},${lon}`;
    //console.log(`🔍 Checking cache for key: ${cacheKey}`);

    // Check Redis cache first (unless forceApi is set)
    if (!forceApi) {
      let cached = null;
      let ttl = -2;
      try {
        cached = await redisClient.get(cacheKey);
        if (cached) ttl = await redisClient.ttl(cacheKey);
        
        if (cached) {
          //console.log(`✅ Cache HIT - Data found in Redis (TTL: ${ttl}s)`);
        } else {
          //console.log(`❌ Cache MISS - No data in Redis`);
        }
      } catch (redisErr) {
        //console.warn("⚠️ Redis read failed:", redisErr.message);
      }

      // If we have cached data and not forcing refresh
      if (cached && !refresh) {
        //console.log("⚡ Serving weather data from Redis cache");
        const cachedData = JSON.parse(cached);
        return res.json({
          ...cachedData,
          fromCache: true,
          ttl,
          cacheKey
        });
      }

      //refresh logic with rate limiting
      if (refresh === "true" && cached) {
      const refreshBlockThreshold = 600; // 10 min rule
      if (ttl > refreshBlockThreshold) {
        const refreshAllowedIn = Math.max(ttl - refreshBlockThreshold, 0);
        //console.log(`🚫 Refresh blocked - TTL: ${ttl}s, must wait ${refreshAllowedIn}s more`);
        return res.status(429).json({
          error: "Refresh not allowed yet. Please wait at least 10 minutes.",
          refreshAllowedIn,
          ttl,
          fromCache: true,
        });
      }
    }
    } else {
      //console.log(`🔧 Force API mode: ${forceApi} - Skipping cache`);
    }
    if (forceApi) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown_ip";
  const forceKey = `force-refresh:${ip}`;
  
  try {
    let count = await redisClient.get(forceKey);
    count = count ? parseInt(count) : 0;

    if (count >= 2) {
      //console.log(`🚫 Force refresh limit reached for IP: ${ip}`);
      return res.status(429).json({
        error: "Force refresh limit reached. Max 2 per hour allowed.",
        fromCache: true,
      });
    }

    //counter with expiry of 1 hour
    await redisClient.multi()
      .incr(forceKey)
      .expire(forceKey, 3600) // 1 hour
      .exec();

   // console.log(`⚡ Force refresh count for IP ${ip}: ${count + 1}`);
  } catch (err) {
   // console.warn("⚠️ Redis error during force refresh rate limit:", err.message);
  }
}

   // console.log("🌐 Cache miss or refresh requested - Making API calls...");
    let result = null;

    //Calculating moon phase locally using astronomical formula
    const calculateMoonPhase = (date = new Date()) => {
      // Using the astronomical formula for moon phase calculation
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      
      // Calculate Julian Date
      let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) 
             + Math.floor(275 * month / 9) + day + 1721013.5;
      
      // Days since new moon on January 6, 2000
      const daysSinceNew = jd - 2451549.5;
      
      // Moon's synodic period (average)
      const synodicMonth = 29.53058867;
      
      // Calculate phase (0 to 1)
      const phase = (daysSinceNew % synodicMonth) / synodicMonth;
      
      let phaseName = "New Moon";
      let phaseNum = 0;
      
      if (phase < 0.03 || phase > 0.97) {
        phaseName = "New Moon";
        phaseNum = 0;
      } else if (phase >= 0.03 && phase < 0.22) {
        phaseName = "Waxing Crescent";
        phaseNum = 1;
      } else if (phase >= 0.22 && phase < 0.28) {
        phaseName = "First Quarter";
        phaseNum = 2;
      } else if (phase >= 0.28 && phase < 0.47) {
        phaseName = "Waxing Gibbous";
        phaseNum = 3;
      } else if (phase >= 0.47 && phase < 0.53) {
        phaseName = "Full Moon";
        phaseNum = 4;
      } else if (phase >= 0.53 && phase < 0.72) {
        phaseName = "Waning Gibbous";
        phaseNum = 5;
      } else if (phase >= 0.72 && phase < 0.78) {
        phaseName = "Third Quarter";
        phaseNum = 6;
      } else if (phase >= 0.78 && phase < 0.97) {
        phaseName = "Waning Crescent";
        phaseNum = 7;
      }
      
      //console.log("" Calculated moon phase:", { phase, phaseName, phaseNum });
      
      return {
      phase: phaseNum,
      name: phaseName,
      value: parseFloat((Math.cos(phase * 2 * Math.PI) * -0.5 + 0.5).toFixed(4))
    };
    };

    const useTomorrow = async () => {
      //console.log(" [Tomorrow.io] Fetching...");
      
      const mapWeatherCode = (tomorrowCode) => {
        const weatherCodeMap = {
          1000: 0, 1001: 1, 1100: 1, 1101: 2, 1102: 3, 2000: 45, 2100: 45,
          4000: 51, 4001: 53, 4200: 61, 4201: 63, 5000: 71, 5001: 73,
          5100: 71, 5101: 75, 6000: 80, 6001: 82, 6200: 85, 7000: 85, 8000: 95,
        };
        return weatherCodeMap[tomorrowCode] || 0;
      };

      const mapPrecipitationType = (type) => {
        const precipMap = { 0: "None", 1: "Rain", 2: "Snow", 3: "Freezing Rain", 4: "Ice Pellets" };
        return precipMap[type] || "None";
      };

      // Get sunrise/sunset times from separate API
      const getSunTimes = async () => {
        try {
          const sunRes = await axios.get(
            `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`
          );
          //console.log(" Sunrise/Sunset data:", sunRes.data);
          return {
            sunrise: sunRes.data.results.sunrise,
            sunset: sunRes.data.results.sunset
          };
        } catch (err) {
          //console.warn(" Failed to fetch sun times:", err.message);
          return { sunrise: null, sunset: null };
        }
      };

      // Fetch all data in parallel
      const [tomorrowRes, airRes, moonPhase, sunTimes] = await Promise.all([
        axios.get(
          `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&fields=temperature,humidity,windSpeed,temperatureApparent,weatherCode,uvIndex,rainIntensity,precipitationType,visibility&apikey=${process.env.TOMORROW_API_KEY}`
        ),
        axios.get(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,ozone,nitrogen_dioxide,sulphur_dioxide,uv_index`
        ),
        Promise.resolve(calculateMoonPhase()),
        getSunTimes()
      ]);

      //console.log(" Tomorrow.io FULL raw response:", JSON.stringify(tomorrowRes.data, null, 2));
      //console.log("AQI raw response:", JSON.stringify(airRes.data, null, 2));
      
      const values = tomorrowRes.data.data.values;
      
      const processedResult = {
        weather: {
          temperature_2m: values.temperature,
          relative_humidity_2m: values.humidity,
          windspeed_10m: values.windSpeed * 3.6, // m/s to km/h
          apparent_temperature: values.temperatureApparent,
          weather_code: mapWeatherCode(values.weatherCode),
          uv_index: values.uvIndex || 0,
          rain_intensity: values.rainIntensity || 0,
          precipitation_type: mapPrecipitationType(values.precipitationType),
          precipitation_type_raw: values.precipitationType || 0,
          sunrise_time: sunTimes.sunrise,
          sunset_time: sunTimes.sunset,
          visibility: values.visibility || 0,
          moon_phase_value: moonPhase.value,
          moon_phase: moonPhase.phase,
          moon_phase_name: moonPhase.name,
          temp: values.temperature,
          windspeed: values.windSpeed * 3.6,
        },
        air_quality: airRes.data.current,
        source: "Tomorrow.io + Open-Meteo AQI",
        location_source: req.query.lat && req.query.lon ? "browser" : "ip",
        refreshed: !!refresh,
        timestamp: new Date().toISOString()
      };
      
      //console.log(" Tomorrow.io processed result:", JSON.stringify(processedResult, null, 2));
      return processedResult;
    };

    const useWeatherbit = async () => {
      console.log("🌍 [Weatherbit] Fetching...");
      
      // FIXED: Get sunrise/sunset from sunrise-sunset.org instead of Weatherbit
      const getSunTimes = async () => {
        try {
          const sunRes = await axios.get(
            `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`
          );
          //console.log(" Sunrise/Sunset data:", sunRes.data);
          return {
            sunrise: sunRes.data.results.sunrise,
            sunset: sunRes.data.results.sunset
          };
        } catch (err) {
          //console.warn("Failed to fetch sun times:", err.message);
          return { sunrise: null, sunset: null };
        }
      };

      // Fetch weather from Weatherbit
      const [wbWeather, airRes, moonPhase, sunTimes] = await Promise.all([
        axios.get(
          `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${process.env.WEATHERBIT_API_KEY}&units=M`
        ),
        axios.get(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,ozone,nitrogen_dioxide,sulphur_dioxide,uv_index`
        ),
        Promise.resolve(calculateMoonPhase()),
        getSunTimes()
      ]);

      //console.log("Weatherbit FULL raw response:", JSON.stringify(wbWeather.data, null, 2));
      
      const weatherData = wbWeather.data.data[0];
      //console.log(" Weatherbit weather data extracted:", JSON.stringify(weatherData, null, 2));

      const processedResult = {
        weather: {
          temperature_2m: weatherData.temp,
          relative_humidity_2m: weatherData.rh,
          windspeed_10m: weatherData.wind_spd * 3.6, // m/s to km/h
          apparent_temperature: weatherData.app_temp,
          weather_code: weatherData.weather?.code || 0,
          visibility: weatherData.vis || 0,
          uv_index: weatherData.uv || 0,
          sunrise_time: sunTimes.sunrise, // Using sunrise-sunset.org API
          sunset_time: sunTimes.sunset,   // Using sunrise-sunset.org API
          moon_phase_value: moonPhase.value,
          moon_phase: moonPhase.phase,
          moon_phase_name: moonPhase.name,
          temp: weatherData.temp,
          windspeed: weatherData.wind_spd * 3.6,
        },
        air_quality: airRes.data.current,
        source: "Weatherbit + Open-Meteo AQI",
        location_source: req.query.lat && req.query.lon ? "browser" : "ip",
        refreshed: !!refresh,
        timestamp: new Date().toISOString()
      };
      
     // console.log("Weatherbit processed result:", JSON.stringify(processedResult, null, 2));
      return processedResult;
    };

    const useOpenMeteo = async () => {
     // console.log("[Open-Meteo] Fetching...");
      
      // Get sunrise/sunset
      const getSunTimes = async () => {
        try {
          const sunRes = await axios.get(
            `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`
          );
          return {
            sunrise: sunRes.data.results.sunrise,
            sunset: sunRes.data.results.sunset
          };
        } catch (err) {
         // console.warn(" Failed to fetch sun times:", err.message);
          return { sunrise: null, sunset: null };
        }
      };
      
      const [omWeather, omAir, moonPhase, sunTimes] = await Promise.all([
        axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,windspeed_10m,weather_code,apparent_temperature`
        ),
        axios.get(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,ozone,nitrogen_dioxide,sulphur_dioxide,uv_index`
        ),
        Promise.resolve(calculateMoonPhase()),
        getSunTimes()
      ]);
      
     // console.log(" Open-Meteo weather raw:", JSON.stringify(omWeather.data, null, 2));
      //console.log(" Open-Meteo air raw:", JSON.stringify(omAir.data, null, 2));

      return {
        weather: {
          ...omWeather.data.current,
          sunrise_time: sunTimes.sunrise,
          sunset_time: sunTimes.sunset,
          moon_phase_value: moonPhase.value,
          moon_phase: moonPhase.phase,
          moon_phase_name: moonPhase.name,
        },
        air_quality: omAir.data.current,
        source: "Open-Meteo",
        location_source: req.query.lat && req.query.lon ? "browser" : "ip",
        refreshed: !!refresh,
        timestamp: new Date().toISOString()
      };
    };

    // API selection logic
    try {
      if (forceApi === "tomorrow") {
        result = await useTomorrow();
      } else if (forceApi === "weatherbit") {
        result = await useWeatherbit();
      } else if (forceApi === "openmeteo") {
        result = await useOpenMeteo();
      } else {
        try {
          result = await useTomorrow();
        } catch (e1) {
          console.warn("❌ Tomorrow.io failed:", e1.message);
          try {
            result = await useWeatherbit();
          } catch (e2) {
            console.warn("❌ Weatherbit failed:", e2.message);
            result = await useOpenMeteo();
          }
        }
      }
    } catch (errFinal) {
      console.error("❌ All weather APIs failed:", errFinal.message);
      return res.status(500).json({ error: errFinal.message });
    }

    // Redis cache (1800s = 30 minutes)
    if (!forceApi) {
      try {
        const cacheExpiry = 1800; 
        await redisClient.setEx(cacheKey, cacheExpiry, JSON.stringify(result));
        console.log(` Weather data stored (30 min) (source: ${result.source})`);
        console.log(`Cache key: ${cacheKey}, Expiry: ${cacheExpiry}s`);
      } catch (redisWriteErr) {
        console.warn("Failed to store weather in Redis:", redisWriteErr.message);
      }
    }

    console.log(`Sending fresh weather data from ${result.source}`);
    res.json({
      ...result,
      fromCache: false,
      cacheKey
    });

  } catch (error) {
    console.error("❌ Weather route error:", error.message);
    console.error("❌ Full error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GOOGLE OAUTH GET INFO ROUTE
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// GET PASSWORD INFO FROM TOKEN
router.get('/password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      console.error('❌ [PASSWORD] JWT error:', jwtErr.message);
      return res.status(400).json({ 
        error: 'Invalid or expired password link',
        expired: jwtErr.name === 'TokenExpiredError'
      });
    }

    // FIND USER BY EMAIL AND VERIFY TOKEN MATCHES
    const user = await User.findOne({ 
      email: decoded.email,
      passwordToken: token  // Verify this is the correct token
    });
    
    if (!user) {
      console.error('❌ [PASSWORD] User not found or token mismatch');
      return res.status(404).json({ error: 'Invalid or expired password link' });
    }

    // Return user info with password
    res.json({ 
      name: user.name,
      email: user.email,
      password: user.tempPassword,
      passwordTime: user.tempPasswordCreatedAt
    });
   // console.log('user details=',user.name,user.email, user.tempPassword, user.tempPasswordCreatedAt);
  } catch (err) {
    console.error('❌ [PASSWORD] Server error:', err);
    res.status(500).json({ error: 'Failed to retrieve password' });
  }
});

// GOOGLE OAUTH CALLBACK 
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  async (req, res) => {
    try {
      const user = req.user;
      const isNewUser = !user.welcomeEmailSent; 
      const isProd = process.env.NODE_ENV === 'production';
      const source = req.query.state;

      // Generate tokens
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
      );
      
      const passwordToken = jwt.sign(
        { email: user.email, jti: crypto.randomBytes(16).toString('hex') },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
      );
      
      // Store password token
      user.passwordToken = passwordToken;
      user.passwordTokenCreatedAt = new Date();
      
      const passwordLink = `${process.env.FRONTEND_URL}/password/${passwordToken}`;
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'None' : 'Lax',
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });

      // Send welcome email ONLY if Google provider AND not sent before
      const shouldSendWelcome = user.provider === 'google' && !user.welcomeEmailSent;
      
      if (shouldSendWelcome) {
        console.log(`📧 [GOOGLE OAUTH] Scheduling welcome email for: ${user.email}`);
        
        // Send email asynchronously to not block the redirect
        setImmediate(async () => {
          try {
            await sendEmail(
              user.email,
              'Welcome to Carbon Footprint Tracker! 🌍',
              welcomeEmailHtmlG(user.name, passwordLink)
            );
            
            // Update flag ONLY after successful send
            await User.findByIdAndUpdate(user._id, { welcomeEmailSent: true });
            console.log(`✅ [GOOGLE OAUTH] Welcome email sent to: ${user.email}`);
          } catch (emailError) {
            console.error(`❌ [GOOGLE OAUTH] Email failed for ${user.email}:`, emailError.message);
            // Don't update welcomeEmailSent flag so we can retry later
          }
        });
      } else {
        console.log(`ℹ️ [GOOGLE OAUTH] Welcome email already sent or not Google provider: ${user.email}`);
      }

      // Clean up verification fields if verified
      if (user.isVerified) {
        user.resendAttempts = undefined;
        user.lastResendAt = undefined;
      }

      // Save user (for passwordToken)
      await user.save();

      // Redirect
      let redirectPath = '/login';
      if (source === 'register') redirectPath = '/register';
      else if (source === 'login') redirectPath = '/login';

      const baseURL = isProd ? 'https://carbonft.app' : 'http://localhost:3000';
      const redirectURL = `${baseURL}${redirectPath}?googleAuth=success&userName=${encodeURIComponent(user.name)}${isNewUser ? '&firstTime=true' : ''}`;

      res.redirect(redirectURL);
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      const errorRedirect = isProd 
        ? 'https://carbonft.app/login?error=auth_failed'
        : 'http://localhost:3000/login?error=auth_failed';

      return res.redirect(errorRedirect);
    }
  }
);

module.exports = router;
