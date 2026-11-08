const express = require('express');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// The docs page runs scripts and styles that helmet's strict default policy would block.
// So /docs gets a relaxed policy, and it is mounted BEFORE the global helmet below.
app.use(
  '/docs',
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(openapi)
);

app.use(helmet()); // strict defaults for the API itself
app.use(express.json());

app.use(healthRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(adminRoutes);

app.use(errorHandler); // must be LAST

module.exports = app;