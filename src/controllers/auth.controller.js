const bcrypt = require('bcrypt');
const { createUser, findByEmail, findById } = require('../db/users');
const { signAccessToken, generateRefreshToken, hashToken } = require('../utils/tokens');
const {
  saveRefreshToken,
  findByTokenHash,
  consumeToken,
  revokeAllForUser,
} = require('../db/refreshTokens');

const BCRYPT_ROUNDS = 12; // cost factor: higher = slower = safer

// A real hash of a throwaway password. Used when the email doesn't exist,
// so login takes the same time either way.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

const INVALID_REFRESH = { error: 'Invalid or expired refresh token' };

// Creates an access token plus a new refresh token (only its hash is stored).
async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();
  await saveRefreshToken({ userId: user.id, tokenHash, expiresAt });
  return { accessToken, refreshToken };
}

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

  const tokens = await issueTokens(user);
  return res.json({
    ...tokens,
    tokenType: 'Bearer',
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  const stored = await findByTokenHash(hashToken(refreshToken));

  if (!stored) return res.status(401).json(INVALID_REFRESH);
  if (new Date(stored.expires_at) < new Date()) return res.status(401).json(INVALID_REFRESH);

  // Rotation: revoke the old token. Only one request can win this.
  const consumed = await consumeToken(stored.id);
  if (!consumed) {
    // The token was already used or revoked: possible theft. Log the user out everywhere.
    await revokeAllForUser(stored.user_id);
    return res.status(401).json(INVALID_REFRESH);
  }

  // Reload the user so a changed role or a deleted account is respected.
  const user = await findById(stored.user_id);
  if (!user) return res.status(401).json(INVALID_REFRESH);

  const tokens = await issueTokens(user);
  return res.json({ ...tokens, tokenType: 'Bearer' });
}

module.exports = { signup, login, refresh };