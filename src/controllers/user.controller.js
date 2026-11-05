const { findById, findAll } = require('../db/users');

async function me(req, res) {
  // req.user comes from the authenticate middleware. We reload from the DB
  // so the data is fresh and deleted users can't keep using old tokens.
  const user = await findById(req.user.id);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  return res.json({ user });
}

async function listUsers(req, res) {
  const users = await findAll();
  return res.json({ users });
}

module.exports = { me, listUsers };