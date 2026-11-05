const bcrypt = require('bcrypt');
const { createUser } = require('../db/users');

const BCRYPT_ROUNDS = 12; // cost factor: higher = slower = safer

async function signup(req, res) {
  const { email, password, name } = req.body;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await createUser({ email, passwordHash, name });
    return res.status(201).json({ user });
  } catch (err) {
    // 23505 = Postgres "unique violation" (email already exists)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw err; // Express 5 sends this to the error handler
  }
}

module.exports = { signup };
