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

module.exports = { createUser };
