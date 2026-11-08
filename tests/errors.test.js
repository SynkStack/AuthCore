const request = require('supertest');
const app = require('../src/app');
const { initDb, resetDb, closeDb, pool } = require('./helpers/db');

beforeAll(initDb);
beforeEach(resetDb);
afterEach(() => jest.restoreAllMocks()); // undo the fakes below after every test
afterAll(closeDb);

describe('error handling', () => {
  it('returns 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('Content-Type', 'application/json')
      .send('{bad');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid request' });
  });

  it('returns a generic 500 and does not leak internal details', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // keep test output quiet
    jest.spyOn(pool, 'query').mockRejectedValueOnce(new Error('secret db details'));

    const res = await request(app)
      .post('/auth/signup')
      .send({ email: 'a@example.com', password: 'supersecret1', name: 'A' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });
});