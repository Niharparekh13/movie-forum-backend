import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { listReviewsByMovie, createReview, updateReview, deleteReview, } from '../controllers/review.controller.js';
const r = Router();
/**
 * Public: list reviews for a given movie
 * GET /api/reviews/movie/:movieId
 * (Order matters: keep this before any "/:id" pattern routes)
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
export default r;
