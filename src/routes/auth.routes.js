const express = require('express');
const validate = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');
const { signupSchema, loginSchema } = require('../validators/auth.validator');
const { signup, login } = require('../controllers/auth.controller');

const router = express.Router();
router.post('/auth/signup', validate(signupSchema), signup);
// The limiter runs first, so blocked clients never reach bcrypt.
router.post('/auth/login', loginLimiter, validate(loginSchema), login);

module.exports = router;
