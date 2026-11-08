const rateLimit = require('express-rate-limit');
const { loginRateLimit } = require('../config/env');

// Max failed login attempts per IP per 15 minutes (default 10).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: loginRateLimit,
  skipSuccessfulRequests: true, // only failed attempts count toward the limit
  standardHeaders: 'draft-7',   // adds RateLimit-* headers
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});

module.exports = { loginLimiter };