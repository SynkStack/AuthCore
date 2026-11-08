const request = require('supertest');
const app = require('../../src/app');

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

module.exports = { defaultUser, signupAndLogin };