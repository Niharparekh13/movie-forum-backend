// src/routes/index.ts
import { Router } from 'express';

// ❌ remove ".js" suffixes
import auth from './auth.routes';
import movie from './movie.routes';
import review from './review.routes';

const router = Router();

// Handy index
router.get('/', (_req, res) => {
  res.json({
    name: 'Movie Forum API',
    endpoints: {
      health: '/health',
      auth: ['/api/auth/register', '/api/auth/login', '/api/auth/me'],
      movies: [
        'GET /api/movies',
        'GET /api/movies/:id',
        'POST /api/movies (auth)',
        'PUT /api/movies/:id (auth)',
        'DELETE /api/movies/:id (auth + ADMIN)'
      ],
      reviews: [
        'GET /api/reviews/movie/:movieId',
        'POST /api/reviews (auth)',
        'PUT /api/reviews/:id (auth)',
        'DELETE /api/reviews/:id (auth)'
      ]
    }
  });
});

router.use('/auth', auth);
router.use('/movies', movie);
router.use('/reviews', review);

export default router;
