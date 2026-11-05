const express = require('express');
const { authenticate } = require('../middleware/auth');
const { me } = require('../controllers/user.controller');

const router = express.Router();
router.get('/me', authenticate, me);

module.exports = router;