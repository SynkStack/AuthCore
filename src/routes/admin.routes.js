const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { listUsers } = require('../controllers/user.controller');

const router = express.Router();
// Order matters: log in first, then check the role.
router.get('/admin/users', authenticate, requireRole('admin'), listUsers);

module.exports = router;