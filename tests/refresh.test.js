const request = require('supertest');
const app = require('../src/app');
const { initDb, resetDb, closeDb, pool } = require('./helpers/db');
const { signupAndLogin } = require('./helpers/auth');

beforeAll(initDb);
beforeEach(resetDb);
afterAll(closeDb);

const refresh = (refreshToken) => request(app).post('/auth/refresh').send({ refreshToken });

describe('POST /auth/refresh', () => {
  it('returns new tokens and rotates the refresh token', async () => {
    const { refreshToken } = await signupAndLogin();
    const res = await refresh(refreshToken);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toHaveLength(96);
    expect(res.body.refreshToken).not.toBe(refreshToken);
  });

  it('returns an access token that works on a protected route', async () => {
    const { refreshToken } = await signupAndLogin();
    const res = await refresh(refreshToken);
    const me = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${res.body.accessToken}`);

    expect(me.status).toBe(200);
  });

  it('rejects the old token after rotation', async () => {
    const { refreshToken } = await signupAndLogin();
    await refresh(refreshToken);
    const res = await refresh(refreshToken);

    expect(res.status).toBe(401);
  });

  it('revokes every token of the user when an old token is reused', async () => {
    const { refreshToken } = await signupAndLogin();
    const rotated = await refresh(refreshToken); // old -> new
    await refresh(refreshToken); // reusing the old one signals possible theft
    const res = await refresh(rotated.body.refreshToken); // the new one is dead too

    expect(res.status).toBe(401);
  });

  it('rejects an unknown token with 401', async () => {
    const res = await refresh('nonsense');

    expect(res.status).toBe(401);
  });

  it('rejects an expired token with 401', async () => {
    const { refreshToken } = await signupAndLogin();
    await pool.query("UPDATE refresh_tokens SET expires_at = now() - interval '1 minute'");
    const res = await refresh(refreshToken);

    expect(res.status).toBe(401);
  });

  it('rejects a missing token with 400', async () => {
    const res = await request(app).post('/auth/refresh').send({});

    expect(res.status).toBe(400);
  });
});