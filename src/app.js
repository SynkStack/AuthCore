const express = require('express');
const helmet = require('helmet');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json());

app.use(healthRoutes);
app.use(authRoutes);

app.use(errorHandler); // must be LAST

module.exports = app;
