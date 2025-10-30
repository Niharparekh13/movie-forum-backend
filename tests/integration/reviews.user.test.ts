import request from 'supertest';
import app from '../../src/app';
import { loginAs, authPost, authPut, authDel } from '../helpers';

const ADMIN = { email: 'admin@example.com', password: 'AdminPass123!' };
const USER  = { email: 'user@example.com',  password: 'User@123' };

function uniqueTitle(base = 'ReviewTarget') {
  return `${base} ${Date.now()}`;
}

describe('Reviews (user-owned CRUD)', () => {
  let userToken: string;
  let adminToken: string;
  let movieId: number;
  let createdReviewId: number;

  beforeAll(async () => {
    // login
    userToken  = await loginAs(USER.email, USER.password);
    adminToken = await loginAs(ADMIN.email, ADMIN.password);

    // create a fresh public movie (admin) so the user has not reviewed it yet
    const title = uniqueTitle();
    const createMovie = await authPost('/api/movies', adminToken, {
      title,
      genre: 'Sci-Fi',
      releaseYear: 2021,
      description: 'Temp movie for review tests',
      runtimeMin: 101,
      isPublic: true
    });
    expect(createMovie.status).toBe(201);
    movieId = createMovie.body.data.id;
  });

  test('GET /api/reviews/movie/:movieId -> 200 list', async () => {
    const r = await request(app).get(`/api/reviews/movie/${movieId}`);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body.data)).toBe(true);
  });

  test('POST /api/reviews (USER) -> 201 creates', async () => {
    const r = await authPost('/api/reviews', userToken, {
      movieId,
      rating: 7,
      title: 'Solid',
      comment: 'good movie'
    });
    expect(r.status).toBe(201);
    expect(r.body).toHaveProperty('data.id');
    createdReviewId = r.body.data.id;
  });

  test('POST /api/reviews duplicate (same user+movie) -> 409', async () => {
    const r = await authPost('/api/reviews', userToken, {
      movieId,
      rating: 8,
      title: 'dup',
      comment: 'dup'
    });
    expect(r.status).toBe(409);
  });

  test('POST /api/reviews -> 422 invalid payload', async () => {
    const r = await authPost('/api/reviews', userToken, {
      movieId,
      rating: 100, // invalid
      title: '',
      comment: ''
    });
    expect(r.status).toBe(422);
  });

  test('PUT /api/reviews/:id (owner) -> 200 updates', async () => {
    const r = await authPut(`/api/reviews/${createdReviewId}`, userToken, {
      rating: 9,
      comment: 'even better on rewatch'
    });
    expect(r.status).toBe(200);
    expect(r.body.data).toHaveProperty('rating', 9);
  });

  test('PUT /api/reviews/:id (not owner) -> 403', async () => {
    const r = await authPut(`/api/reviews/${createdReviewId}`, adminToken, { rating: 5 });
    expect(r.status).toBe(403);
  });

  test('PUT /api/reviews/:id -> 404 unknown', async () => {
    const r = await authPut('/api/reviews/999999', userToken, { rating: 6 });
    expect(r.status).toBe(404);
  });

  test('PUT /api/reviews/:id -> 400 invalid id', async () => {
    const r = await authPut('/api/reviews/abc', userToken, { rating: 7 });
    expect(r.status).toBe(400);
  });

  test('DELETE /api/reviews/:id (owner) -> 204', async () => {
    const r = await authDel(`/api/reviews/${createdReviewId}`, userToken);
    expect(r.status).toBe(204);
  });

  test('DELETE /api/reviews/:id (not owner) -> 403', async () => {
    // Recreate with user, then try delete with admin (must satisfy validator)
    const create = await authPost('/api/reviews', userToken, {
      movieId,
      rating: 8,
      title: 'tmp',
      comment: 'temp' // non-empty to pass validation
    });
    expect(create.status).toBe(201);
    const reviewId = create.body.data.id;

    const r = await authDel(`/api/reviews/${reviewId}`, adminToken);
    expect(r.status).toBe(403);

    // cleanup by owner
    await authDel(`/api/reviews/${reviewId}`, userToken);
  });
});
