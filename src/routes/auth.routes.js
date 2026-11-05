const express = require('express');
const validate = require('../middleware/validate');
const { signupSchema } = require('../validators/auth.validator');
const { signup } = require('../controllers/auth.controller');

const router = express.Router();
router.post('/auth/signup', validate(signupSchema), signup);

module.exports = router;
