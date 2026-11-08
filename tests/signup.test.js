const request = require('supertest');
const app = require('../src/app');
const { initDb, resetDb, closeDb, pool } = require('./helpers/db');

const validUser = { email: 'test@example.com', password: 'supersecret1', name: 'Test User' };

beforeAll(initDb);
beforeEach(resetDb);
afterAll(closeDb);

describe('POST /auth/signup', () => {
  it('creates a member and never returns the password hash', async () => {
    const res = await request(app).post('/auth/signup').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.role).toBe('member');
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('ignores a client-supplied role', async () => {
    const res = await request(app).post('/auth/signup').send({ ...validUser, role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('member');
  });

  it('lowercases the email', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ ...validUser, email: 'Test@Example.COM' });

    expect(res.body.user.email).toBe('test@example.com');
  });

  it('stores a bcrypt hash, not the plain password', async () => {
    await request(app).post('/auth/signup').send(validUser);
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE email = $1', [
      validUser.email,
    ]);

    expect(rows[0].password_hash).not.toBe(validUser.password);
    expect(rows[0].password_hash.startsWith('$2b$')).toBe(true);
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/auth/signup').send(validUser);
    const res = await request(app).post('/auth/signup').send(validUser);

    expect(res.status).toBe(409);
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app).post('/auth/signup').send({ ...validUser, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects an invalid email with 400', async () => {
    const res = await request(app).post('/auth/signup').send({ ...validUser, email: 'nope' });

    expect(res.status).toBe(400);
  });

  it('rejects an empty body with 400', async () => {
    const res = await request(app).post('/auth/signup').send({});

    expect(res.status).toBe(400);
  });
});