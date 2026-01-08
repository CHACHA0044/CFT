// middleware/authmiddleware.js
const jwt = require('jsonwebtoken');
const redisClient = require('../RedisClient');

async function authenticateToken(req, res, next) {
  let token = req.cookies?.token;

  // Authorization header fallback
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
      requiresLogin: true,
    });
  }

  try {
    //VERIFYING JWT FIRST
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //CHECKING BLACKLIST BY JTI (NOT TOKEN STRING)
    const blacklistKey = `blacklist:jti:${decoded.jti}`;
    const isBlacklisted = await redisClient.get(blacklistKey);

    if (isBlacklisted) {
      console.log('[AUTH] Blacklisted JTI detected:', decoded.jti);

      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: 'Lax', //SAME IN DEV + PROD
        domain: isProd ? '.carbonft.app' : undefined,
        path: '/',
      });

      return res.status(401).json({
        error: 'Session expired. Please login again.',
        requiresLogin: true,
      });
    }

    // ATTACHING USER
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AUTH] JWT error:', err.message);

    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax', // NEVER None without HTTPS
      domain: isProd ? '.carbonft.app' : undefined,
      path: '/',
    });

    return res.status(401).json({
      error: 'Invalid or expired token.',
      requiresLogin: true,
    });
  }
}

module.exports = authenticateToken;