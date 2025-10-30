import { Router } from 'express';
import {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie, // <-- standard name
} from '../controllers/movie.controller';
import { authGuard, requireRole } from '../middleware/auth';
import { validateMovie } from '../validators/movie.dto';

const r = Router();

r.get('/', listMovies);
r.get('/:id', getMovie);

// ADMIN-only for write ops
r.post('/', authGuard, requireRole('ADMIN'), validateMovie, createMovie);
r.put('/:id', authGuard, requireRole('ADMIN'), validateMovie, updateMovie);
r.delete('/:id', authGuard, requireRole('ADMIN'), deleteMovie);

export default r;
