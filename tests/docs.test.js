const request = require('supertest');
const app = require('../src/app');
const spec = require('../src/docs/openapi');

describe('API docs', () => {
  it('serves the Swagger UI page', async () => {
    const res = await request(app).get('/docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('documents every route', () => {
    expect(Object.keys(spec.paths).sort()).toEqual([
      '/admin/users',
      '/auth/login',
      '/auth/logout',
      '/auth/refresh',
      '/auth/signup',
      '/health',
      '/me',
    ]);
  });
});