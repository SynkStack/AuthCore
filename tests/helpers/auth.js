const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('./db');

const defaultUser = { email: 'test@example.com', password: 'supersecret1', name: 'Test User' };

// Creates a user, logs in, and returns the tokens.
async function signupAndLogin(overrides = {}) {
  const credentials = { ...defaultUser, ...overrides };
  await request(app).post('/auth/signup').send(credentials);
  const res = await request(app)
    .post('/auth/login')
    .send({ email: credentials.email, password: credentials.password });

  return {
    credentials,
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    userId: res.body.user.id,
  };
}

// Signups can never create admins, so we promote the user directly in the database,
// then log in again (the role is stored inside the token).
async function createAdminAndLogin() {
  const credentials = { ...defaultUser, email: 'admin@example.com', name: 'Admin' };
  await request(app).post('/auth/signup').send(credentials);
  await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [credentials.email]);
  const res = await request(app)
    .post('/auth/login')
    .send({ email: credentials.email, password: credentials.password });

  return { accessToken: res.body.accessToken };
}

module.exports = { defaultUser, signupAndLogin, createAdminAndLogin };