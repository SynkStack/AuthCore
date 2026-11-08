const express = require('express');
const validate = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');
const { signupSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');
const { signup, login, refresh, logout } = require('../controllers/auth.controller');

const router = express.Router();
router.post('/auth/signup', validate(signupSchema), signup);
// The limiter runs first, so blocked clients never reach bcrypt.
router.post('/auth/login', loginLimiter, validate(loginSchema), login);
router.post('/auth/refresh', validate(refreshSchema), refresh);
router.post('/auth/logout', validate(refreshSchema), logout);

module.exports = router;