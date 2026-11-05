const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtAccessSecret, jwtAccessExpiresIn, refreshTokenDays } = require('../config/env');

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

// SHA-256 is fine here (not for passwords): the token is 48 random bytes, so it can't be guessed.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// "token" goes to the client. Only "tokenHash" is stored in the database.
function generateRefreshToken() {
  const token = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + refreshTokenDays * 24 * 60 * 60 * 1000);
  return { token, tokenHash, expiresAt };
}

module.exports = { signAccessToken, verifyAccessToken, hashToken, generateRefreshToken };