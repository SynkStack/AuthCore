const request = require('supertest');
const app = require('../src/app');
const { initDb, resetDb, closeDb, pool } = require('./helpers/db');
const { defaultUser } = require('./helpers/auth');

const credentials = { email: defaultUser.email, password: defaultUser.password };

beforeAll(initDb);
beforeEach(async () => {
  await resetDb();
  await request(app).post('/auth/signup').send(defaultUser);
});
afterAll(closeDb);

describe('POST /auth/login', () => {
  it('returns access and refresh tokens for correct credentials', async () => {
    const res = await request(app).post('/auth/login').send(credentials);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toHaveLength(96);
    expect(res.body.tokenType).toBe('Bearer');
    expect(res.body.user.email).toBe(defaultUser.email);
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('stores only the hash of the refresh token', async () => {
    const res = await request(app).post('/auth/login').send(credentials);
    const { rows } = await pool.query('SELECT token_hash FROM refresh_tokens');

    expect(rows).toHaveLength(1);
    expect(rows[0].token_hash).not.toBe(res.body.refreshToken);
    expect(rows[0].token_hash).toHaveLength(64);
  });

  it('rejects a wrong password with 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ ...credentials, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('gives the same error for an unknown email as for a wrong password', async () => {
    const wrongPassword = await request(app)
      .post('/auth/login')
      .send({ ...credentials, password: 'wrongpassword' });
    const unknownEmail = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'supersecret1' });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  it('rejects an invalid body with 400', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'nope' });

    expect(res.status).toBe(400);
  });
});