const express = require('express');
const helmet = require('helmet');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(helmet());
app.use(express.json());

app.use(healthRoutes);
app.use(authRoutes);
app.use(userRoutes);

app.use(errorHandler); // must be LAST
app.use(userRoutes);
app.use(adminRoutes);

module.exports = app;