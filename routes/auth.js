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
const rateLimit = require("express-rate-limit");
const csrf = require('csurf');
const isProd = process.env.NODE_ENV === 'production';
const ALLOWED_ORIGINS = [ "https://carbonft.app", "https://www.carbonft.app", "http://localhost:3000", ];

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

const feedbackReplyHtml = (name = {}) => {

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

const welcomeEmailHtmlG = (name = {} ) => {
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
      <a href="https://www.carbonft.app/" style="color: #1d4ed8; text-decoration: none;">CFT</a>
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

const weatherLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests / 15 min / IP
  message: "Too many requests, slow down"
});

async function redisLimiter(req, res, next) {
  try {
    const ip = req.ip;
    const key = `weather_rl:${ip}`;

    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, 900);
    }

    if (count > 30) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    next();
  } catch (err) {
    console.error("Redis limiter error:", err.message);
    next(); // fail open so users aren't blocked
  }
}

function generateTokens(userId) {
  const accessJti = crypto.randomBytes(16).toString('hex');
  const refreshJti = crypto.randomBytes(16).toString('hex');
  
  const accessToken = jwt.sign(
    { userId, jti: accessJti, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, jti: refreshJti, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '14d' }
  );
  
  return { accessToken, refreshToken, refreshJti };
}

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'Strict' : 'Lax',
    domain: isProd ? '.carbonft.app' : undefined
  }
});

// GET ME
router.get('/token-info/me', authenticateToken, csrfProtection, async (req, res) => {
  const startTime = Date.now();
 // console.log('\n [/token-info/me] Request received');

  try {
    // Extract token
    let token = req.cookies.token || req.query.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      //console.log(' [AUTH] No token provided');
      return res.status(401).json({ error: 'Missing token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(` [JWT] Token verified for userId: ${decoded.userId}`);

    const cacheKey = `user:profile:v2:${decoded.userId}`;
    
    // Try cache first
    const cached = await getCachedData(cacheKey);
    if (cached) {
      const responseTime = Date.now() - startTime;
     // console.log(` [RESPONSE] Sent from cache in ${responseTime}ms`);
      return res.json({
        ...cached.data,
        fromCache: true,
        cacheTTL: cached.ttl,
        responseTime: `${responseTime}ms`
      });
    }

    // Fetch from database
   // console.log(` [DATABASE] Fetching user from MongoDB...`);
    const dbStartTime = Date.now();
    
    const user = await User.findOne({ userId: decoded.userId }).select('name isVerified').lean();
    
    const dbTime = Date.now() - dbStartTime;
    //console.log(` [DATABASE] Query completed in ${dbTime}ms`);

    if (!user) {
    //  console.log(` [DATABASE] User not found: ${decoded.userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      name: user.name,
      verified: user.isVerified,
      //userId: decoded.userId ,
      // Email removed for security - not exposed to client
    };

    // Cache for 30 minutes (1800 seconds)
    const cacheTTL = 1800;
    await setCachedData(cacheKey, userData, cacheTTL);

    const responseTime = Date.now() - startTime;
    //console.log(` [RESPONSE] Sent from database in ${responseTime}ms`);
    
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

// CSRF(cross site request forgery) protection on GET requests doesn't make sense. CSRF tokens are for state-changing operations (POST, PUT, DELETE).
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});


// LOGIN
router.post('/login', csrfProtection, async (req, res) => {
  const startTime = Date.now();
  console.log('[LOGIN] Authentication request initiated');
  
  try {
    const { email, password } = req.body;
    
    // Early validation to fail fast
    if (!email || !password) {
      console.log('[LOGIN] Validation failed - missing credentials');
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    console.log(`[LOGIN] Processing login for: ${email}`);

    // Rate limiting check - this should be first to prevent abuse
    const loginAttemptKey = `login:attempts:${email}`;
    const { count: attemptCount, ttl: attemptTTL } = await getRateLimitData(loginAttemptKey);
    
    if (attemptCount >= 5) {
      console.log(`[LOGIN] Rate limit exceeded for ${email} - ${attemptCount} attempts`);
      return res.status(429).json({ 
        error: 'Too many login attempts. Please try again later.',
        retryAfter: attemptTTL,
        attemptsRemaining: 0
      });
    }
    //Blacklisting old token if user is already logged in
    try {
      if (req.cookies?.token) {
        const oldToken = req.cookies.token;
        const decoded = jwt.decode(oldToken);
        
        if (decoded && decoded.jti) {
          const oldBlacklistKey = `blacklist:jti:${decoded.jti}`;
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          
          if (ttl > 0) {
            await setCachedData(oldBlacklistKey, { invalidated: true }, ttl);
            console.log(`[LOGIN] Old token blacklisted: ${decoded.jti}`);
          }
        }
      }
    } catch (blacklistErr) {
      console.warn('[LOGIN] Could not blacklist old token:', blacklistErr.message);
      // Continuing with login even if blacklist fails
    }

    // Optimized user lookup with caching
    const userCacheKey = `user:login:${email}`;
    let user = null;
    let fromCache = false;

    // Try cache first for faster response
    const cachedUser = await getCachedData(userCacheKey);
    
    if (cachedUser?.data) {
      console.log(`[LOGIN] User data retrieved from cache`);
      fromCache = true;
      
      // Fetching minimal user data from database to verify current state
      user = await User.findOne({ userId: cachedUser.data.userId })
        .select('_id userId email passwordHash isVerified provider welcomeEmailSent')
        .lean();
    } else {
      console.log(`[LOGIN] Querying database for user`);
      
      // Optimized database query with lean() and minimal field selection
      user = await User.findOne({ email })
        .select('_id userId name email passwordHash isVerified provider welcomeEmailSent')
        .lean();
      
      // Cached user lookup for 10 minutes to speed up subsequent attempts
      if (user) {
        await setCachedData(userCacheKey, { 
          userId: user.userId,  // custom userId
          isVerified: user.isVerified 
        }, 600);
        console.log(`[LOGIN] User data cached for future requests`);
      }
    }
    
    // User not found - increment rate limit before responding
    if (!user) {
      console.log(`[LOGIN] Authentication failed - user not found: ${email}`);
      await incrementRateLimit(loginAttemptKey, 900);
      
      // Use generic error message to prevent user enumeration
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Password verification - this is CPU intensive so we do it after all checks
    console.log(`[LOGIN] Verifying password for user`);
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      console.log(`[LOGIN] Authentication failed - invalid password for: ${email}`);
      await incrementRateLimit(loginAttemptKey, 900);
      
      // Same generic error to prevent user enumeration
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Email verification check
    if (!user.isVerified) {
      console.log(`[LOGIN] Account not verified: ${email}`);
      return res.status(403).json({ 
        error: 'Please verify your email before logging in.' 
      });
    }

    // Successful login - clear failed attempts and generate token
    await deleteKey(loginAttemptKey);
    console.log(`[LOGIN] Failed attempts cleared for: ${email}`);

    // Generating JWT with custom userId instead of MongoDB _id
    const token = jwt.sign(
      {
        userId: user.userId,  //Using custom userId field, NOT user._id
        jti: crypto.randomBytes(16).toString('hex')
      },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    const isProd = process.env.NODE_ENV === 'production';

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Strict',
      domain: isProd ? '.carbonft.app' : undefined,
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    const responseTime = Date.now() - startTime;
    console.log(`[LOGIN] Authentication successful for: ${email} | Time: ${responseTime}ms | Cache: ${fromCache}`);

    // Send welcome email for first-time local users asynchronously
    if (user.provider === 'local' && !user.welcomeEmailSent) {
      setImmediate(async () => {
        try {
          console.log(`[LOGIN] Scheduling welcome email for first-time user`);
          
          await sendEmail(
            user.email,
            '🎉 Welcome to Your Carbon Journey!',
            welcomeEmailHtml(user.name)
          );
          
          // Update flag without blocking
          await User.findByIdAndUpdate(
            user._id, 
            { welcomeEmailSent: true },
            { lean: true }
          );
          
          console.log(`[LOGIN] Welcome email sent successfully`);
        } catch (emailError) {
          console.error(`[LOGIN] Welcome email failed: ${emailError.message}`);
        }
      });
    }

    // Return minimal response without sensitive data
    return res.json({
      message: 'Login successful',
      user: {
        name: user.name
      }
    });

  } catch (err) {
    const responseTime = Date.now() - startTime;
    console.error(`[LOGIN] Server error after ${responseTime}ms:`, err.message);
    
    return res.status(500).json({ 
      error: 'Server error during login.' 
    });
  }
});

// LOGOUTT
router.post('/logout', authenticateToken, async (req, res) => {
  console.log('\n🚪 [/logout] Logout request received');
  
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.decode(token);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      
      if (ttl > 0) {
        const blacklistKey = `blacklist:jti:${decoded.jti}`;
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
      sameSite: 'Strict',
      domain: isProd ? '.carbonft.app' : undefined,
    });

return res.json({ message: 'Logged out successfully' });

  } catch (err) {
    console.error('❌ [SERVER ERROR] Logout error:', err);
    res.status(500).json({ error: 'Server error during logout.' });
  }
});

// FEEDBACK SUBMISSION RECORD OF EVERY USER
router.post('/feedback/submit', csrfProtection, authenticateToken, async (req, res) => {
  console.log('\n📝 [/feedback/submit] Feedback submission started');
  
  try {
    const { feedback } = req.body;
    
    if (!feedback || feedback.trim() === '') {
      console.log('❌ [VALIDATION] Empty feedback message');
      return res.status(400).json({ error: "Feedback message is required." });
    }

    // Rate limit: 1 submission per day (24 hours)
    const feedbackRateKey = `feedback:submissions:${req.user.userId}`;
    const rateLimit = await getRateLimitData(feedbackRateKey);
    
    if (rateLimit.count >= 1) {
      console.log(`🚫 [RATE LIMIT] Feedback blocked for userId: ${req.user.userId} | Submissions: ${rateLimit.count}`);
      return res.status(429).json({ 
        error: 'You can only submit 1 feedback per day.',
        retryAfter: rateLimit.ttl
      });
    }

    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      console.log(`❌ [DATABASE] User not found: ${req.user.userId}`);
      return res.status(404).json({ error: "User not found." });
    }

    console.log(`📝 [FEEDBACK] Received from ${user.email}: ${feedback.substring(0, 50)}...`);

    // ✅ Increment rate limit counter FIRST (24 hours = 86400 seconds)
    await incrementRateLimit(feedbackRateKey, 86400);

    // ✅ Then update database
    user.feedbackGiven = true;
    await user.save();
    console.log(`✅ [DATABASE] feedbackGiven set to true for: ${user.email}`);

    // Prepare feedback notification email for admin
    const currentTime = formatTime(new Date(), "Asia/Kolkata");
    const currentDate = formatDate(new Date(), "Asia/Kolkata");
    
    const feedbackNotificationHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">
        <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
          <h1 style="margin: 0; font-size: 20px;">📝 New Feedback Received</h1>
        </div>
        <div style="padding: 20px 16px 12px;">
          <div style="background: rgba(255, 255, 255, 0.08); border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.15); max-width: 600px; margin: auto; padding: 24px 20px; box-shadow: 0 0 22px rgba(255, 255, 255, 0.18);">
            <h2 style="font-size: 18px; margin: 0 0 20px; color: #e0e0e0;">Feedback Details</h2>
            
            <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px; color: #a0a0a0; font-size: 14px;"><strong>From:</strong> ${user.name}</p>
              <p style="margin: 0 0 10px; color: #a0a0a0; font-size: 14px;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 0 0 10px; color: #a0a0a0; font-size: 14px;"><strong>User ID:</strong> ${user._id}</p>
              <p style="margin: 0; color: #a0a0a0; font-size: 14px;"><strong>Time:</strong> ${currentTime} on ${currentDate}</p>
            </div>
            
            <div style="background: rgba(47, 128, 237, 0.1); border-left: 4px solid #2f80ed; padding: 15px; border-radius: 8px;">
              <p style="margin: 0 0 8px; color: #56ccf2; font-size: 14px; font-weight: bold;">Feedback Message:</p>
              <p style="margin: 0; color: #e0e0e0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${feedback}</p>
            </div>
          </div>
        </div>
        <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">© 2025 Carbon Tracker • Feedback System</div>
      </div>
    `;

    // Send emails asynchronously
    const emailPromises = [
      // Thank you email to user
      sendEmail(
        user.email,
        "Thanks for your feedback ✨",
        feedbackReplyHtml(user.name, { timeZone: "Asia/Kolkata" })
      ).catch(err => {
        console.error(`❌ [EMAIL ERROR] Thank-you email failed for ${user.email}:`, err.message);
        return { success: false, type: 'user' };
      }),
      
      // Feedback notification to admin
      sendEmail(
        "pdembla@student.iul.ac.in",
        `New Feedback from ${user.name}`,
        feedbackNotificationHtml
      ).catch(err => {
        console.error(`❌ [EMAIL ERROR] Admin notification failed:`, err.message);
        return { success: false, type: 'admin' };
      })
    ];

    const emailResults = await Promise.all(emailPromises);
    
    const userEmailSuccess = emailResults[0] !== undefined && emailResults[0].success !== false;
    const adminEmailSuccess = emailResults[1] !== undefined && emailResults[1].success !== false;

    console.log(`✅ [EMAIL] User thank-you: ${userEmailSuccess}, Admin notification: ${adminEmailSuccess}`);

    return res.json({ 
      message: "Feedback submitted successfully!",
      feedbackReceived: true,
      emailSent: userEmailSuccess
    });

  } catch (err) {
    console.error("❌ [SERVER ERROR] Feedback submission error:", err);
    res.status(500).json({ error: "Server error while submitting feedback." });
  }
});

// THANKS MY G
router.post('/feedback/resend-thankyou', authenticateToken, csrfProtection, async (req, res) => {
  console.log('\n📧 [/feedback/resend-thankyou] Resend request received');
  
  try {
    const user = await User.findOne({ userId: req.user.userId });
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

// REGISTER
router.post('/register', csrfProtection, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already in use.' });

    const passwordHash = await bcrypt.hash(password, 10); //previously 12 but reduced to save cpu cost and time
    const verificationToken = jwt.sign({ email, jti: crypto.randomBytes(16).toString('hex')},  process.env.JWT_SECRET,  { expiresIn: '10m' });
    const randomPart = crypto.randomBytes(16).toString('hex');
    const timestampPart = Date.now().toString(36);
    const userId = `CFT_user_${randomPart}_${timestampPart}_`;

    const newUser = new User({
      userId,
      name,
      email,
      passwordHash,
      verificationToken,
      isVerified: false,
      resendAttempts: 0,        
      lastResendAt: Date.now(), 
      // userId will be auto-generated by pre-save hook
    });
    await newUser.save();

    const verificationLink =
      `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await sendEmail(
        email,
        'Verify your Carbon Footprint Tracker account',
        emailHtml(name, verificationLink)
      );
    } catch (emailErr) {
      console.error('❌ Email send failed:', emailErr.message);

      // IMPORTANT: user exists but email didn't go → frontend
      return res.status(400).json({
        error: 'We could not deliver email. Please check your email address and try again.'
      });
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.'
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// VERIFYROUTE
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

// USERNAME FROM EMAIL
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

// RESEND VERIFICATION EMAIL
router.post('/resend-verification', csrfProtection, async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });

if (!user) {
  // try finding by previous pending email
  user = await User.findOne({
    isVerified: false,
    provider: "local"
  });

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Update email
  user.email = email;
}

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
    //not setting headers now because single domain(for cors issues so tht FE can call this endpoint across domains)
    // res.set({
    //   'Access-Control-Allow-Origin': req.headers.origin || '*',
    //   'Access-Control-Allow-Credentials': 'true',
    //   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    //   'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    //   'Content-Type': 'application/json'
    // });

    try {
      // randomized cpu work so each ping does different amount of calculations, makes it harder to predict server load
      const iterations = Math.floor(500 + Math.random() * 1500); // random between 500-2000 instead of fixed 1000(older)
      const operations = [
        (i, r) => Math.sqrt(i * r),
        (i, r) => Math.pow(i, r % 3),
        (i, r) => Math.log(i + 1) * r,
        (i, r) => Math.sin(i) * Math.cos(r * i),
        (i, r) => (i * r) % 997 // prime number modulo for extra randomness
      ];
      
      // pick random operation for this ping so cpu signature varies each time
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const sum = Array.from({ length: iterations }, (_, i) => operation(i, Math.random()))
        .reduce((a, b) => a + b, 0);

      // Lightweight Redis operation, incr is a redis command that automatically creates pinghit adn increments it, then return incremented value
      const hits = await redisClient.incr('ping_hits');

      // MDB checking 
      const mongooseStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      const readableTime = formatTime(new Date(), "Asia/Kolkata");
      
      // randomize response format slightly so its not identical each time, makes scraping harder
      const calcMessage = Math.random() > 0.5 
        ? `Server is awake and did 14,000,605 calculations...${iterations.toLocaleString()} ${readableTime}`
        : `Good evening, Colonel. Can I give you a lift? ${iterations.toLocaleString()} ${readableTime}`;
      
      res.status(200).json({
        message: calcMessage,
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
router.get("/weather-aqi", weatherLimiter, redisLimiter, authenticateToken, async (req, res) => {
  const origin = req.headers.origin;
if (ALLOWED_ORIGINS.includes(origin)) {
  res.setHeader("Access-Control-Allow-Origin", origin);
}
if (req.method === "OPTIONS") {
  return res.sendStatus(200);
}

  
// US AQI breakpoints
const US_AQI_BREAKPOINTS = {
  pm25: [
    [0,12,0,50],
    [12.1,35.4,51,100],
    [35.5,55.4,101,150],
    [55.5,150.4,151,200],
    [150.5,250.4,201,300],
    [250.5,500.4,301,500]
  ],
  pm10: [
    [0,54,0,50],
    [55,154,51,100],
    [155,254,101,150],
    [255,354,151,200],
    [355,424,201,300],
    [425,604,301,500]
  ]
};
function calculateUSAQI(concentration, pollutant) {
  const breakpoints = US_AQI_BREAKPOINTS[pollutant];

  for (let [cl, ch, il, ih] of breakpoints) {
    if (concentration >= cl && concentration <= ch) {
      const aqi =
        ((ih - il) / (ch - cl)) *
        (concentration - cl) +
        il;

      return Math.round(aqi);
    }
  }

  return null;
}
function getAqiStatus(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Poor";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Severe";
  return "Hazardous";
}

let { lat, lon, refresh, forceApi } = req.query;
  
try {
  // Get location from IP if coordinates not provided
  if (!lat || !lon) {
      const ipRes = await axios.get("http://ip-api.com/json/");
      lat = ipRes.data.lat;  // Changed from .latitude
      lon = ipRes.data.lon;  // Changed from .longitude
    }
  
  // Replaced the existing rounding logic because it was creating 2 diffrent cache keys for same loc
  lat = Math.round(parseFloat(lat) * 100) / 100;
  lon = Math.round(parseFloat(lon) * 100) / 100;
const cacheKey = `weather:${lat},${lon}`;

// Check cache first
let cached = null;
let ttl = -2;

try {
  cached = await redisClient.get(cacheKey);
  if (cached) {
    ttl = await redisClient.ttl(cacheKey);
  }
} catch (redisErr) {
  console.warn("Redis read failed:", redisErr.message);
}

// If cache exists and NOT a refresh request, return cached data immediately
if (cached) {
  const cachedData = JSON.parse(cached);
  
  if (refresh !== "true") {
    // Serve cached data immediately
    res.json({
      ...cachedData,
      fromCache: true,
      ttl,
      cacheKey
    });
    
    // If TTL < 5 minutes, refresh in background
    if (ttl > 0 && ttl < 300) {
      setImmediate(async () => {
        try {
          const freshData = await useTomorrow();
          await redisClient.setEx(cacheKey, 1800, JSON.stringify(freshData));
        } catch (err) {
          console.error("Background refresh failed:", err.message);
        }
      });
    }
    return;
  }
}

// If refresh requested, enforce rate limits
if (refresh === "true") {
  if (!cached) {
    return res.status(400).json({
      error: "No cached data to refresh. Please load weather data first."
    });
  }

  const cachedData = JSON.parse(cached);
  const dataAge = 1800 - ttl;
  const refreshAllowedAfter = 600; // 10 minutes

  if (dataAge < refreshAllowedAfter) {
    return res.status(429).json({
      error: "Refresh not allowed yet. Please wait 10 minutes after initial data fetch.",
      refreshAllowedIn: refreshAllowedAfter - dataAge,
      ttl,
      dataTimestamp: cachedData.timestamp,
      fromCache: true
    });
  }

  // Check IP-based refresh limit
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown_ip";
  const refreshKey = `refresh-limit:${ip}`;

  try {
    let refreshCount = await redisClient.get(refreshKey);
    refreshCount = refreshCount ? parseInt(refreshCount) : 0;

    if (refreshCount >= 5) {
      return res.status(429).json({
        error: "Too many refresh requests. Please try again later.",
        retryAfter: await redisClient.ttl(refreshKey)
      });
    }

    await redisClient.multi()
      .incr(refreshKey)
      .expire(refreshKey, 3600)
      .exec();
  } catch (err) {
    console.warn("Redis refresh rate limit error:", err.message);
  }
}

// Handle forceApi parameter (for testing different providers)
if (forceApi) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown_ip";
  const forceKey = `force-api:${ip}`;

  try {
    let forceCount = await redisClient.get(forceKey);
    forceCount = forceCount ? parseInt(forceCount) : 0;

    if (forceCount >= 2) {
      return res.status(429).json({
        error: "Force API limit reached. Maximum 2 requests per hour.",
        retryAfter: await redisClient.ttl(forceKey)
      });
    }

    await redisClient.multi()
      .incr(forceKey)
      .expire(forceKey, 3600)
      .exec();
  } catch (err) {
    console.warn("Redis forceApi rate limit error:", err.message);
  }
}
  console.log("Cache miss or refresh requested - fetching from API");

   // console.log("🌐 Cache miss or refresh requested - Making API calls...");
    let result = null;

    const calculateMoonPhase = (date = new Date()) => {
  const SYNODIC_MONTH = 29.53058867;
  const NEW_MOON_JD = 2451549.5; // Jan 6, 2000

  // --- Julian Date ---
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const jd =
    367 * year -
    Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
    Math.floor(275 * month / 9) +
    day +
    1721013.5;

  // --- Moon age in days ---
  const daysSinceNew = jd - NEW_MOON_JD;
  const moonAge = ((daysSinceNew % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // --- Phase fraction (0 → 1) ---
  const phase = moonAge / SYNODIC_MONTH;

  // --- Illumination (0 → 100%) ---
  const illumination = Math.round(
    (1 - Math.cos(2 * Math.PI * phase)) * 50
  );

  // --- Phase definitions ---
  const phases = [
    { name: "New Moon", emoji: "🌑" },
    { name: "Waxing Crescent", emoji: "🌒" },
    { name: "First Quarter", emoji: "🌓" },
    { name: "Waxing Gibbous", emoji: "🌔" },
    { name: "Full Moon", emoji: "🌕" },
    { name: "Waning Gibbous", emoji: "🌖" },
    { name: "Third Quarter", emoji: "🌗" },
    { name: "Waning Crescent", emoji: "🌘" }
  ];

  const phaseIndex = Math.floor(phase * 8) % 8;

  return {
    phaseIndex,
    name: phases[phaseIndex].name,
    emoji: phases[phaseIndex].emoji,
    illumination,        // %
    waxing: phase < 0.5, // boolean
    phaseValue: +phase.toFixed(4)
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

      const values = tomorrowRes.data.data.values;
      const aqiPM25 = calculateUSAQI(
        airRes.data.current.pm2_5,
        "pm25"
      );

      const aqiPM10 = calculateUSAQI(
        airRes.data.current.pm10,
        "pm10"
      );
    const finalAQI = Math.max(aqiPM25, aqiPM10);
    console.log(" Tomorrow.io FULL raw response:", JSON.stringify(tomorrowRes.data, null, 2));
    console.log("AQI raw response:", JSON.stringify(airRes.data, null, 2));

      const processedResult = {
        weather: {
        temperature_2m: values.temperature,
        relative_humidity_2m: values.humidity,
        windspeed_10m: values.windSpeed * 3.6,
        apparent_temperature: values.temperatureApparent,
        weather_code: mapWeatherCode(values.weatherCode),
        uv_index: values.uvIndex || 0,
        rain_intensity: values.rainIntensity || 0,
        precipitation_type: mapPrecipitationType(values.precipitationType),
        precipitation_type_raw: values.precipitationType || 0,
        precipitation_probability: values.precipitationProbability || 0,
        pressure_sea_level: values.pressureSeaLevel || 0,
        pressure_surface_level: values.pressureSurfaceLevel || 0,
        sunrise_time: sunTimes.sunrise,
        sunset_time: sunTimes.sunset,
        visibility: values.visibility || 0,
        moonPhase: {
        name: moonPhase.name,
        emoji: moonPhase.emoji,
        illumination: moonPhase.illumination,
        waxing: moonPhase.waxing,
        phaseValue: moonPhase.phaseValue,
        phaseIndex: moonPhase.phaseIndex
      },
        temp: values.temperature,
        windspeed: values.windSpeed * 3.6,
      },
        air_quality: {
          ...airRes.data.current,
          aqi: finalAQI,
          status: getAqiStatus(finalAQI)
        },
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
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,hourly=pm10,pm2_5,ozone,nitrogen_dioxide,sulphur_dioxide,uv_index`
        ),
        Promise.resolve(calculateMoonPhase()),
        getSunTimes()
      ]);

      const weatherData = wbWeather.data.data[0];
      //console.log(" Weatherbit weather data extracted:", JSON.stringify(weatherData, null, 2));
      const aqiPM25 = calculateUSAQI(
        airRes.data.current.pm2_5,
        "pm25"
      );

      const aqiPM10 = calculateUSAQI(
        airRes.data.current.pm10,
        "pm10"
      );
      const finalAQI = Math.max(aqiPM25, aqiPM10);
      console.log("Weatherbit FULL raw response:", JSON.stringify(wbWeather.data, null, 2));  
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
         moonPhase: {
  name: moonPhase.name,
  emoji: moonPhase.emoji,
  illumination: moonPhase.illumination,
  waxing: moonPhase.waxing,
  phaseValue: moonPhase.phaseValue,
  phaseIndex: moonPhase.phaseIndex
},
          temp: weatherData.temp,
          windspeed: weatherData.wind_spd * 3.6,
        },
        air_quality: {
          ...airRes.data.current,
          aqi: finalAQI,
          status: getAqiStatus(finalAQI)
        },
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
      const aqiPM25 = calculateUSAQI(
        omAir.data.current.pm2_5,
        "pm25"
      );

      const aqiPM10 = calculateUSAQI(
        omAir.data.current.pm10,
        "pm10"
      );
      const finalAQI = Math.max(aqiPM25, aqiPM10);

      return {
        weather: {
          ...omWeather.data.current,
          sunrise_time: sunTimes.sunrise,
          sunset_time: sunTimes.sunset,
          moonPhase: {
  name: moonPhase.name,
  emoji: moonPhase.emoji,
  illumination: moonPhase.illumination,
  waxing: moonPhase.waxing,
  phaseValue: moonPhase.phaseValue,
  phaseIndex: moonPhase.phaseIndex
},
        },
        air_quality: {
          ...omAir.data.current,
          aqi: finalAQI,
          status: getAqiStatus(finalAQI)
        },
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
    // dev log= res.status(500).json({ error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
});

// GOOGLE OAUTH GET INFO ROUTE
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// GOOGLE OAUTH CALLBACK 
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }),
  async (req, res) => {
    try {
      const user = req.user;
      const isNewUser = !user.welcomeEmailSent; 
      const isProd = process.env.NODE_ENV === 'production';
      const source = req.query.state;

      // Generate tokens
      const token = jwt.sign(
        { userId: user.userId, jti: crypto.randomBytes(16).toString('hex') },  
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
      );
      
      // const passwordToken = jwt.sign(
      //   { email: user.email, jti: crypto.randomBytes(16).toString('hex') },
      //   process.env.JWT_SECRET,
      //   { expiresIn: '3d' }
      // );
      
      // Store password token
      // user.passwordToken = passwordToken;
      // user.passwordTokenCreatedAt = new Date();
      
      // const passwordLink = `${process.env.FRONTEND_URL}/password/${passwordToken}`;
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'Strict',   
        domain: isProd ? '.carbonft.app' : undefined,
        path: '/',
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
              welcomeEmailHtmlG(user.name)
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
