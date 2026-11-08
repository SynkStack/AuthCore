const request = require('supertest');
const app = require('../src/app');
const { initDb, resetDb, closeDb } = require('./helpers/db');

beforeAll(initDb);
beforeEach(resetDb);
afterAll(closeDb);

describe('login rate limiting', () => {
  it('blocks login after too many failed attempts', async () => {
    const attempt = () =>
      request(app)
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'wrongpassword' });

    // The test limit is 5 (set in tests/setup-env.js).
    for (let i = 0; i < 5; i++) {
      const res = await attempt();
      expect(res.status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/too many/i);
  });
});