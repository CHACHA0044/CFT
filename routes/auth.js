const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const axios = require('axios');
const authenticateToken = require('../middleware/authmiddleware');
const router = express.Router();
const crypto = require('crypto');
const redisClient = require('../RedisClient');
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
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />

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
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />

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
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
    "Content-Type": "application/json",
  });

  let { lat, lon, refresh, forceApi } = req.query;

  try {
    // Get location from IP if missing
    if (!lat || !lon) {
      const ipRes = await axios.get("https://ipapi.co/json/");
      lat = ipRes.data.latitude;
      lon = ipRes.data.longitude;
    }

    const cacheKey = `weather:${lat},${lon}`;
    console.log(`🔍 Checking cache for key: ${cacheKey}`);

    // Check Redis cache first (unless forceApi is set)
    if (!forceApi) {
      let cached = null;
      let ttl = -2;
      try {
        cached = await redisClient.get(cacheKey);
        if (cached) ttl = await redisClient.ttl(cacheKey);
        
        if (cached) {
          console.log(`✅ Cache HIT - Data found in Redis (TTL: ${ttl}s)`);
        } else {
          console.log(`❌ Cache MISS - No data in Redis`);
        }
      } catch (redisErr) {
        console.warn("⚠️ Redis read failed:", redisErr.message);
      }

      // If we have cached data and not forcing refresh
      if (cached && !refresh) {
        console.log("⚡ Serving weather data from Redis cache");
        const cachedData = JSON.parse(cached);
        return res.json({
          ...cachedData,
          fromCache: true,
          ttl,
          cacheKey
        });
      }

      // Handle refresh logic with rate limiting
      if (refresh && cached) {
        const refreshBlockThreshold = 1200; // 20 min rule
        if (ttl > refreshBlockThreshold) {
          const refreshAllowedIn = Math.max(ttl - refreshBlockThreshold, 0);
          console.log(`🚫 Refresh blocked - TTL: ${ttl}s, must wait ${refreshAllowedIn}s more`);
          return res.status(429).json({
            error: "Refresh not allowed yet. Please wait at least 10 minutes.",
            refreshAllowedIn,
            ttl,
            fromCache: true,
          });
        }
      }
    } else {
      console.log(`🔧 Force API mode: ${forceApi} - Skipping cache`);
    }

    console.log("🌐 Cache miss or refresh requested - Making API calls...");
    let result = null;

    const useTomorrow = async () => {
      console.log("🌍 [Tomorrow.io] Fetching...");
      
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

      const mapMoonPhase = (phase) => {
        if (phase >= 0.0625 && phase <= 0.1875) return { phase: 1, name: "Waxing Crescent" };
        if (phase >= 0.1875 && phase <= 0.3125) return { phase: 2, name: "First Quarter" };
        if (phase >= 0.3125 && phase <= 0.4375) return { phase: 3, name: "Waxing Gibbous" };
        if (phase >= 0.4375 && phase <= 0.5625) return { phase: 4, name: "Full Moon" };
        if (phase >= 0.5625 && phase <= 0.6875) return { phase: 5, name: "Waning Gibbous" };
        if (phase >= 0.6875 && phase <= 0.8125) return { phase: 6, name: "Third Quarter" };
        if (phase >= 0.8125 && phase <= 0.9375) return { phase: 7, name: "Waning Crescent" };
        return { phase: 0, name: "New Moon" };
      };

      // Fetch weather from Tomorrow.io
      const r = await axios.get(
        `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&fields=temperature,humidity,windSpeed,temperatureApparent,weatherCode,uvIndex,rainIntensity,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,weatherCodeFullDay&apikey=${process.env.TOMORROW_API_KEY}`
      );

      // Fetch air quality from Open-Meteo
      const airRes = await axios.get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,ozone,nitrogen_dioxide,sulphur_dioxide,uv_index`
      );

      const values = r.data.data.values;
      const moonPhaseData = mapMoonPhase(values.moonPhase || 0);

      return {
        weather: {
          temperature_2m: values.temperature,
          relative_humidity_2m: values.humidity,
          windspeed_10m: values.windSpeed * 3.6, // m/s to km/h
          apparent_temperature: values.temperatureApparent,
          weather_code: mapWeatherCode(values.weatherCode),
          weather_code_full_day: values.weatherCodeFullDay,
          uv_index: values.uvIndex || 0,
          rain_intensity: values.rainIntensity || 0,
          precipitation_type: mapPrecipitationType(values.precipitationType),
          precipitation_type_raw: values.precipitationType || 0,
          sunrise_time: values.sunriseTime,
          sunset_time: values.sunsetTime,
          visibility: values.visibility || 0,
          moon_phase_value: values.moonPhase || 0,
          moon_phase: moonPhaseData.phase,
          moon_phase_name: moonPhaseData.name,
          temp: values.temperature,
          windspeed: values.windSpeed * 3.6,
        },
        air_quality: airRes.data.current,
        source: "Tomorrow.io + Open-Meteo AQI",
        location_source: req.query.lat && req.query.lon ? "browser" : "ip",
        refreshed: !!refresh,
        timestamp: new Date().toISOString()
      };
    };

    const useWeatherbit = async () => {
      console.log("🌍 [Weatherbit] Fetching...");
      
      // Fetch weather from Weatherbit
      const wbWeather = await axios.get(
        `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${process.env.WEATHERBIT_API_KEY}&units=M`
      );
      
      // Fetch air quality from Open-Meteo
      const airRes = await axios.get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,ozone,nitrogen_dioxide,sulphur_dioxide,uv_index`
      );

      const weatherData = wbWeather.data.data[0];
      console.log("📡 Weatherbit weather data:", weatherData);

      return {
        weather: {
          temperature_2m: weatherData.temp,
          relative_humidity_2m: weatherData.rh,
          windspeed_10m: weatherData.wind_spd * 3.6, // m/s to km/h
          apparent_temperature: weatherData.app_temp,
          weather_code: weatherData.weather?.code || 0,
          visibility: weatherData.vis || 0,
          uv_index: weatherData.uv || 0,
          temp: weatherData.temp,
          windspeed: weatherData.wind_spd * 3.6,
        },
        air_quality: airRes.data.current,
        source: "Weatherbit + Open-Meteo AQI",
        location_source: req.query.lat && req.query.lon ? "browser" : "ip",
        refreshed: !!refresh,
        timestamp: new Date().toISOString()
      };
    };

    const useOpenMeteo = async () => {
      console.log("🌍 [Open-Meteo] Fetching...");
      
      const omWeather = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,windspeed_10m,weather_code,apparent_temperature`
      );
      const omAir = await axios.get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,ozone,nitrogen_dioxide,sulphur_dioxide,uv_index`
      );
      
      console.log("📡 Open-Meteo weather raw:", omWeather.data);
      console.log("📡 Open-Meteo air raw:", omAir.data);

      return {
        weather: omWeather.data.current,
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

    // Redis cache (1800)
    if (!forceApi) {
      try {
        const cacheExpiry = 1800; 
        await redisClient.setEx(cacheKey, cacheExpiry, JSON.stringify(result));
        console.log(`✅ Weather data stored in Redis cache for 30 minutes (source: ${result.source})`);
        console.log(`📦 Cache key: ${cacheKey}, Expiry: ${cacheExpiry}s`);
      } catch (redisWriteErr) {
        console.warn("⚠️ Failed to store weather in Redis:", redisWriteErr.message);
      }
    }

    console.log(`📤 Sending fresh weather data from ${result.source}`);
    res.json({
      ...result,
      fromCache: false,
      cacheKey
    });

  } catch (error) {
    console.error("❌ Weather route error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
