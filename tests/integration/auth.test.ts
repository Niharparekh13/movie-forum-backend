// tests/integration/auth.test.ts
/**
 * Covers proposal/rubric:
 * - APIs functional with tests
 * - Proper status codes & JSON shape
 * - Validation & constraints
 * - JWT security (401 on protected)
 */
import request from 'supertest';
import app from '../../src/app';
import { loginAs, authGet } from '../helpers';

const ADMIN = { email: 'admin@example.com', password: 'AdminPass123!' };
const USER  = { email: 'user@example.com',  password: 'User@123' }; // ← matches your seed

describe('Auth endpoints', () => {
  test('POST /api/auth/login -> 200 returns token for valid creds', async () => {
    const res = await request(app).post('/api/auth/login').send(ADMIN);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data.token');
  });

  test('POST /api/auth/login -> 401 invalid creds', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: ADMIN.email,
      password: 'WrongPass!',
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error.code');
  });

  test('POST /api/auth/register -> 201 creates new user', async () => {
    const stamp = Date.now();
    const email = `stud_${stamp}@test.com`;

    const res = await request(app).post('/api/auth/register').send({
      email,
      username: `stud_${stamp}`,
      password: 'StrongPass1!',
      fullName: 'Student Tester'
    });

    expect(res.status).toBe(201);
    // Assert standard success envelope and email returned (flexible to either {data:{email}} or {data:{user:{email}}})
    expect(res.body).toHaveProperty('data');
    const payload = res.body.data;
    const returnedEmail = payload?.email ?? payload?.user?.email;
    expect(returnedEmail).toBe(email);
  });

  test('POST /api/auth/register -> 409 on duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: USER.email,          // from seed
      username: `dupe_${Date.now()}`,
      password: 'StrongPass1!',
      fullName: 'Dup User'
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBeDefined();
  });

  test('POST /api/auth/register -> 422 on invalid payload', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      username: '',
      password: 'weak',
      fullName: ''
    });
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error.details');
  });

  test('GET /api/auth/me -> 200 with Bearer token', async () => {
    const token = await loginAs(USER.email, USER.password);
    const res = await authGet('/api/auth/me', token);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email', USER.email);
  });

  test('GET /api/auth/me -> 401 missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error.code');
  });

  test('GET /api/auth/me -> 401 invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });
});
