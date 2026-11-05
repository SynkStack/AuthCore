const rateLimit = require('express-rate-limit');

// Max 10 failed login attempts per IP per 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true, // only failed attempts count toward the limit
  standardHeaders: 'draft-7',   // adds RateLimit-* headers
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});

module.exports = { loginLimiter };
