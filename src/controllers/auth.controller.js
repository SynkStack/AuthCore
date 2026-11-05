const bcrypt = require('bcrypt');
const { createUser, findByEmail } = require('../db/users');
const { signAccessToken } = require('../utils/tokens');

const BCRYPT_ROUNDS = 12; // cost factor: higher = slower = safer

// A real hash of a throwaway password. Used when the email doesn't exist,
// so login takes the same time either way.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

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

async function login(req, res) {
  const { email, password } = req.body;

  const user = await findByEmail(email);
  // Always run one comparison, even for unknown emails.
  const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

  // Same message and status for wrong email and wrong password.
  if (!user || !passwordOk) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const accessToken = signAccessToken(user);
  return res.json({
    accessToken,
    tokenType: 'Bearer',
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

module.exports = { signup, login };
