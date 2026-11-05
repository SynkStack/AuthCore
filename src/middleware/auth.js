const { verifyAccessToken } = require('../utils/tokens');

// Expects the header:  Authorization: Bearer <token>
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role }; // available to later handlers
    return next();
  } catch (err) {
    // Same message for expired, tampered or malformed tokens.
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };