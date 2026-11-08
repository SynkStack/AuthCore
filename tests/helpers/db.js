const fs = require('fs');
const path = require('path');
const pool = require('../../src/db/pool');

// Creates the tables in the test database (safe to repeat).
async function initDb() {
  const sql = fs.readFileSync(path.join(__dirname, '../../src/db/schema.sql'), 'utf8');
  await pool.query(sql);
}

// Empties the tables so every test starts clean.
async function resetDb() {
  await pool.query('TRUNCATE refresh_tokens, users CASCADE');
}

// Without this, Jest hangs because the pool keeps connections open.
async function closeDb() {
  await pool.end();
}

module.exports = { initDb, resetDb, closeDb, pool };