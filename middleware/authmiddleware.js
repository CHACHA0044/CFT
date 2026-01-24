// middleware/authmiddleware.js
const jwt = require('jsonwebtoken');
const redisClient = require('../RedisClient');
const User = require('../models/user');

async function authenticateToken(req, res, next) {
  const startTime = Date.now();
  
  // Extract token from multiple sources with priority
  let token = req.cookies?.token;

  // Fallback to Authorization header
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token found - reject immediately
  if (!token) {
    console.log('[AUTH] No token provided');
    return res.status(401).json({
      error: 'Access denied. No token provided.',
      requiresLogin: true,
    });
  }

  try {
    // Step 1: Verify JWT signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] Token verified for userId: ${decoded.userId}`);

    // Step 2: Validate required fields in decoded token
    if (!decoded.userId || !decoded.jti) {
      console.log('[AUTH] Invalid token structure - missing userId or jti');
      return res.status(401).json({
        error: 'Invalid token structure.',
        requiresLogin: true,
      });
    }

    // Step 3: Check Redis blacklist by JTI
    const blacklistKey = `blacklist:jti:${decoded.jti}`;
    const isBlacklisted = await redisClient.get(blacklistKey);

    if (isBlacklisted) {
      console.log(`[AUTH] Blacklisted token detected - JTI: ${decoded.jti}`);
      
      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: 'Strict',
        domain: isProd ? '.carbonft.app' : undefined,
        path: '/',
      });

      return res.status(401).json({
        error: 'Session expired. Please login again.',
        requiresLogin: true,
      });
    }

    // Step 4: Verify user exists in database with userId
    // Use cache to reduce database hits
    const userCacheKey = `user:auth:${decoded.userId}`;
    let userExists = false;

    try {
      const cached = await redisClient.get(userCacheKey);
      if (cached) {
        userExists = true;
        console.log(`[AUTH] User verified from cache: ${decoded.userId}`);
      } else {
        // Check database if not in cache
        const user = await User.findOne({ userId: decoded.userId })
          .select('_id userId')
          .lean();
        
        if (user) {
          userExists = true;
          // Cache user existence for 10 minutes
          await redisClient.setEx(userCacheKey, 600, JSON.stringify({ exists: true }));
          console.log(`[AUTH] User verified from database: ${decoded.userId}`);
        }
      }
    } catch (cacheErr) {
      console.error('[AUTH] Cache error, checking database:', cacheErr.message);
      
      // Fallback to database if cache fails
      const user = await User.findOne({ userId: decoded.userId })
        .select('_id userId')
        .lean();
      
      userExists = !!user;
    }

    if (!userExists) {
      console.log(`[AUTH] User not found for userId: ${decoded.userId}`);
      
      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: 'Strict',
        domain: isProd ? '.carbonft.app' : undefined,
        path: '/',
      });

      return res.status(401).json({
        error: 'User account not found. Please login again.',
        requiresLogin: true,
      });
    }

    // Step 5: Attach minimal user data to request
    req.user = {
      userId: decoded.userId,
      jti: decoded.jti
    };

    const authTime = Date.now() - startTime;
    console.log(`[AUTH] Authentication successful in ${authTime}ms`);
    
    next();

  } catch (err) {
    const authTime = Date.now() - startTime;
    console.error(`[AUTH] Authentication failed after ${authTime}ms:`, err.message);

    const isProd = process.env.NODE_ENV === 'production';
    
    // Clear invalid cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Strict',
      domain: isProd ? '.carbonft.app' : undefined,
      path: '/',
    });

    // Provide specific error messages based on error type
    let errorMessage = 'Invalid or expired token.';
    
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token expired. Please login again.';
      console.log('[AUTH] Token expired at:', err.expiredAt);
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token. Please login again.';
      console.log('[AUTH] Invalid JWT:', err.message);
    } else if (err.name === 'NotBeforeError') {
      errorMessage = 'Token not yet valid.';
      console.log('[AUTH] Token not yet valid:', err.message);
    }

    return res.status(401).json({
      error: errorMessage,
      requiresLogin: true,
    });
  }
}

module.exports = authenticateToken;