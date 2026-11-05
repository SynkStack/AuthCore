const pool = require('./pool');

// $1, $2... are parameters. Never build SQL with string concatenation.
async function createUser({ email, passwordHash, name }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, role, created_at`, // password_hash is NOT returned
    [email, passwordHash, name]
  );
  return rows[0];
}

// Returns the full row INCLUDING password_hash. Only use it inside login logic.
async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

// Safe lookup for profile data: no password_hash.
async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

module.exports = { createUser, findByEmail, findById };
