const pool = require('./pool');

async function saveRefreshToken({ userId, tokenHash, expiresAt }) {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
}

async function findByTokenHash(tokenHash) {
  const { rows } = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token_hash = $1',
    [tokenHash]
  );
  return rows[0] || null;
}

async function revokeToken(id) {
  await pool.query('UPDATE refresh_tokens SET revoked = true WHERE id = $1', [id]);
}

// Used when a stolen token is detected: log the user out everywhere.
async function revokeAllForUser(userId) {
  await pool.query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [userId]);
}

module.exports = { saveRefreshToken, findByTokenHash, revokeToken, revokeAllForUser };