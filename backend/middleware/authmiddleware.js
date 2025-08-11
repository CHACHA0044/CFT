const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  let token = null;

  // 1️⃣ First check cookie
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 2️⃣ If no cookie, check Authorization header (Bearer <token>)
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 3️⃣ No token → deny access
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // 4️⃣ Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // will include id, email
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = authenticateToken;
