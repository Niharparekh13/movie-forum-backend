import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import {
  listReviewsByMovie,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';

const r = Router();

/**
 * Public: list reviews for a given movie
 * GET /api/reviews/movie/:movieId
 */
r.get('/movie/:movieId', listReviewsByMovie);

/**
 * Auth required: create a review
 * POST /api/reviews
 */
r.post('/', authGuard, createReview);

/**
 * Auth + ownership required: update a review
 * PUT /api/reviews/:id
 */
r.put('/:id', authGuard, updateReview);

/**
 * Auth + ownership required: delete a review
 * DELETE /api/reviews/:id
 */
r.delete('/:id', authGuard, deleteReview);

/**
 * Documentation route
 * GET /api/reviews/docs
 */
r.get('/docs', (req, res) => {
  const routes = [
    { method: 'GET', path: '/movie/:movieId', description: 'List all reviews for a given movie', auth: false },
    { method: 'POST', path: '/', description: 'Create a new review', auth: true },
    { method: 'PUT', path: '/:id', description: 'Update a review (requires ownership)', auth: true },
    { method: 'DELETE', path: '/:id', description: 'Delete a review (requires ownership)', auth: true },
  ];
  res.render('./public/routes_review', { routes });
});

export default r;
