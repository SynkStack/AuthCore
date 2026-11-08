const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { initDb, resetDb, closeDb, pool } = require('./helpers/db');
const { defaultUser, signupAndLogin, createAdminAndLogin } = require('./helpers/auth');

beforeAll(initDb);
beforeEach(resetDb);
afterAll(closeDb);

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

describe('GET /me', () => {
  it('returns the profile for a valid token', async () => {
    const { accessToken, credentials } = await signupAndLogin();
    const res = await request(app).get('/me').set(bearer(accessToken));

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(credentials.email);
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('rejects a request without a token', async () => {
    const res = await request(app).get('/me');

    expect(res.status).toBe(401);
  });

  it('rejects a non-Bearer scheme', async () => {
    const res = await request(app).get('/me').set('Authorization', 'Basic abc123');

    expect(res.status).toBe(401);
  });

  it('rejects a tampered token', async () => {
    const { accessToken } = await signupAndLogin();
    const res = await request(app).get('/me').set(bearer(`${accessToken}x`));

    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const { userId } = await signupAndLogin();
    const expired = jwt.sign({ sub: userId, role: 'member' }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: -10, // already expired 10 seconds ago
    });
    const res = await request(app).get('/me').set(bearer(expired));

    expect(res.status).toBe(401);
  });

  it('rejects a valid token whose user no longer exists', async () => {
    const { accessToken, userId } = await signupAndLogin();
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    const res = await request(app).get('/me').set(bearer(accessToken));

    expect(res.status).toBe(401);
  });
});

describe('GET /admin/users', () => {
  it('returns 403 for a member', async () => {
    const { accessToken } = await signupAndLogin();
    const res = await request(app).get('/admin/users').set(bearer(accessToken));

    expect(res.status).toBe(403);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/admin/users');

    expect(res.status).toBe(401);
  });

  it('lists users for an admin, without password hashes', async () => {
    await request(app)
      .post('/auth/signup')
      .send({ ...defaultUser, email: 'member@example.com' });
    const { accessToken } = await createAdminAndLogin();
    const res = await request(app).get('/admin/users').set(bearer(accessToken));

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users.every((u) => u.password_hash === undefined)).toBe(true);
  });

  it('keeps the old role until the user logs in again', async () => {
    const { accessToken, userId, credentials } = await signupAndLogin();
    await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);

    // The old token still says "member".
    const stale = await request(app).get('/admin/users').set(bearer(accessToken));
    expect(stale.status).toBe(403);

    // A new login stamps the new role into a new token.
    const login = await request(app)
      .post('/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    const fresh = await request(app).get('/admin/users').set(bearer(login.body.accessToken));
    expect(fresh.status).toBe(200);
  });
});