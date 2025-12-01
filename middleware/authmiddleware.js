// middleware/authmiddleware.js
const jwt = require('jsonwebtoken');
const redisClient = require('../RedisClient');

async function authenticateToken(req, res, next) {
  const token = req.cookies?.token;
//auth header check for token=
 if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      requiresLogin: true 
    });
  }

  try {
    // Check if token is blacklisted
    const blacklistKey = `blacklist:token:${token}`;
    const isBlacklisted = await redisClient.get(blacklistKey);
    
    if (isBlacklisted) {
      console.log('🚫 [AUTH] Blacklisted token detected');
      return res.status(401).json({ 
        error: 'Token has been invalidated.',
        requiresLogin: true 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
    });
    
    return res.status(403).json({ 
      error: 'Invalid or expired token.',
      requiresLogin: true 
    });
  }
}

module.exports = authenticateToken;