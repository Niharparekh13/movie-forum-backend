import request from 'supertest';
import app from '../../src/app';
import { loginAs, authPost, authPut, authDel } from '../helpers';

const ADMIN = { email: 'admin@example.com', password: 'AdminPass123!' };
const USER  = { email: 'user@example.com',  password: 'User@123' };

function uniqueTitle(base = 'Test Movie') {
  return `${base} ${Date.now()}`;
}

describe('Movies (ADMIN CRUD)', () => {
  let adminToken: string;
  let userToken: string;
  let createdId: number;

  beforeAll(async () => {
    adminToken = await loginAs(ADMIN.email, ADMIN.password);
    userToken  = await loginAs(USER.email, USER.password);
  });

  test('POST /api/movies (ADMIN) -> 201 + returns movie', async () => {
    const title = uniqueTitle();
    const res = await authPost('/api/movies', adminToken, {
      title,
      genre: 'Sci-Fi',
      releaseYear: 2014,
      description: 'Space + time.',
      runtimeMin: 169,
      isPublic: true
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data.id');
    expect(res.body.data).toHaveProperty('title', title);
    createdId = res.body.data.id;
  });

  test('POST /api/movies (USER) -> 403', async () => {
    const r = await authPost('/api/movies', userToken, {
      title: uniqueTitle(),
      genre: 'Drama',
      releaseYear: 2020,
      description: 'Nope',
      runtimeMin: 100
    });
    expect(r.status).toBe(403);
  });

  test('POST /api/movies (no token) -> 401', async () => {
    const r = await request(app).post('/api/movies').send({
      title: uniqueTitle(), genre: 'Action', releaseYear: 2010, description: 'x', runtimeMin: 120
    });
    expect(r.status).toBe(401);
  });

  test('POST /api/movies -> 422 invalid payload', async () => {
    const r = await authPost('/api/movies', adminToken, {
      title: '', genre: 'Sci-Fi', releaseYear: 1800, description: '', runtimeMin: -5
    });
    expect(r.status).toBe(422);
    expect(r.body).toHaveProperty('error.details');
  });

  test('PUT /api/movies/:id (ADMIN) -> 200 updates', async () => {
    const r = await authPut(`/api/movies/${createdId}`, adminToken, {
      description: 'Updated description.',
      runtimeMin: 170
    });
    expect(r.status).toBe(200);
    expect(r.body.data).toHaveProperty('description', 'Updated description.');
    expect(r.body.data).toHaveProperty('runtimeMin', 170);
  });

  test('PUT /api/movies/:id (USER) -> 403', async () => {
    const r = await authPut(`/api/movies/${createdId}`, userToken, { description: 'user try' });
    expect(r.status).toBe(403);
  });

  test('PUT /api/movies/:id -> 404 unknown', async () => {
    const r = await authPut('/api/movies/999999', adminToken, { description: 'nope' });
    expect(r.status).toBe(404);
  });

  test('PUT /api/movies/:id -> 400 invalid id', async () => {
    const r = await authPut('/api/movies/abc', adminToken, { description: 'bad' });
    expect(r.status).toBe(400);
  });

  test('DELETE /api/movies/:id (ADMIN) -> 204', async () => {
    const r = await authDel(`/api/movies/${createdId}`, adminToken);
    expect(r.status).toBe(204);
  });

  test('DELETE /api/movies/:id -> 404 unknown', async () => {
    const r = await authDel('/api/movies/999999', adminToken);
    expect(r.status).toBe(404);
  });
});
