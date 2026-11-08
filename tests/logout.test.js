const request = require('supertest');
const app = require('../src/app');
const { initDb, resetDb, closeDb } = require('./helpers/db');
const { signupAndLogin } = require('./helpers/auth');

beforeAll(initDb);
beforeEach(resetDb);
afterAll(closeDb);

const logout = (refreshToken) => request(app).post('/auth/logout').send({ refreshToken });

describe('POST /auth/logout', () => {
  it('revokes the refresh token and returns 204', async () => {
    const { refreshToken } = await signupAndLogin();
    const res = await logout(refreshToken);
    const after = await request(app).post('/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(204);
    expect(after.status).toBe(401);
  });

  it('returns 204 for an unknown token', async () => {
    const res = await logout('nonsense');

    expect(res.status).toBe(204);
  });

  it('returns 204 when called twice', async () => {
    const { refreshToken } = await signupAndLogin();
    await logout(refreshToken);
    const res = await logout(refreshToken);

    expect(res.status).toBe(204);
  });

  it('rejects a missing token with 400', async () => {
    const res = await request(app).post('/auth/logout').send({});

    expect(res.status).toBe(400);
  });
});