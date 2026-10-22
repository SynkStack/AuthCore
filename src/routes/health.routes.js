const express = require('express');
const router = express.Router();

// Other services (and Docker later) call this to check AuthCore is alive.
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'authcore',
    uptime: process.uptime(), // seconds since the server started
  });
});

module.exports = router;