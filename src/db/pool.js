const { Pool } = require('pg');
const { databaseUrl } = require('../config/env');

// One shared pool for the whole app.
module.exports = new Pool({ connectionString: databaseUrl });