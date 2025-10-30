// tests/integration/health.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('Health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true }); // ← matches src/app.ts
  });
});
