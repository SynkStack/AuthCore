const jwt = require('jsonwebtoken');
const { jwtAccessSecret, jwtAccessExpiresIn } = require('../config/env');

// Payload holds only what other services need. Never put passwords here: JWTs are readable.
function signAccessToken(user) {
  if (!jwtAccessSecret) throw new Error('JWT_ACCESS_SECRET is not set');
  return jwt.sign({ sub: user.id, role: user.role }, jwtAccessSecret, {
    algorithm: 'HS256',
    expiresIn: jwtAccessExpiresIn,
  });
}

// Pinning the algorithm blocks tokens that claim a weaker one.
function verifyAccessToken(token) {
  return jwt.verify(token, jwtAccessSecret, { algorithms: ['HS256'] });
}

module.exports = { signAccessToken, verifyAccessToken };
