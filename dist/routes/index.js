import { Router } from 'express';
import auth from './auth.routes.js';
import movie from './movie.routes.js';
import review from './review.routes.js';
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
