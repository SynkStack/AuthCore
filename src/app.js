const express = require('express');
const helmet = require('helmet');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(helmet());        // secure headers on every response
app.use(express.json());  // parse JSON request bodies

app.use(healthRoutes);

module.exports = app;