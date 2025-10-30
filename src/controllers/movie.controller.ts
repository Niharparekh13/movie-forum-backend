import { Request, Response } from 'express';
import { prisma } from '../db/clients';
import { error, ok } from '../utils/response';
import { slugify } from '../utils/slug';
import { CreateMovieDto } from '../validators/movie.dto';

/**
 * GET /api/movies?page=1&limit=20
 * Paginated list with meta
 */
async function listMovies(req: Request, res: Response) {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '20'), 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.movie.findMany({ skip, take: limit, orderBy: { id: 'asc' } }),
    prisma.movie.count(),
  ]);

  return res.status(200).json({ data: items, meta: { page, limit, total } });
}

/**
 * GET /api/movies/search?q=ince&genre=Sci-Fi&year=2010&limit=10
 * Lightweight autocomplete / filtered search
 * Note: MySQL is case-insensitive by default → no `mode: 'insensitive'`.
 */
async function searchMovies(req: Request, res: Response) {
  const q = (String(req.query.q ?? '')).trim();
  const genre = req.query.genre ? String(req.query.genre) : undefined;
  const yearRaw = req.query.year ? parseInt(String(req.query.year), 10) : undefined;
  const year = Number.isFinite(yearRaw as number) ? (yearRaw as number) : undefined;
  const take = Math.min(parseInt(String(req.query.limit ?? '10'), 10) || 10, 50);

  const where: any = {};
  if (q) where.title = { contains: q }; // MySQL collations are CI by default
  if (genre) where.genre = genre;
  if (year) where.releaseYear = year;

  const results = await prisma.movie.findMany({
    where,
    take,
    orderBy: { id: 'asc' },
    select: { id: true, title: true, releaseYear: true, slug: true },
  });

  return res.status(200).json({ data: results });
}

/**
 * GET /api/movies/:id
 */
async function getMovie(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json(error('BAD_REQUEST', 'Invalid movie id'));

  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) return res.status(404).json(error('NOT_FOUND', 'Movie not found'));
  return res.json(ok(movie));
}

/**
 * POST /api/movies (ADMIN-only via route guard)
 * Validates input, generates unique slug, returns 201 + Location
 */
async function createMovie(req: Request, res: Response) {
  const parsed = CreateMovieDto.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(422)
      .json(error('VALIDATION_ERROR', 'Invalid input', parsed.error.issues));
  }
  const data = parsed.data;

  const userId = (req as any).user?.id as number | undefined;
  if (!userId) return res.status(401).json(error('UNAUTHORIZED', 'Missing user'));

  // slug de-duplication: base + -2/-3… if needed
  const base = `${slugify(data.title)}-${data.releaseYear}`;
  let slug = base;

  const existing = await prisma.movie.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  if (existing.some((e) => e.slug === base)) {
    let n = 2;
    const set = new Set(existing.map((e) => e.slug));
    while (set.has(`${base}-${n}`)) n++;
    slug = `${base}-${n}`;
  }

  const created = await prisma.movie.create({
    data: {
      title: data.title,
      genre: data.genre,
      releaseYear: data.releaseYear,
      description: data.description,
      runtimeMin: data.runtimeMin,
      isPublic: data.isPublic ?? true,
      posterUrl: data.posterUrl,
      imdbId: data.imdbId,
      slug,
      createdByUserId: userId,
    },
  });

  return res.status(201).location(`/api/movies/${created.id}`).json(ok(created));
}

/**
 * PUT /api/movies/:id (ADMIN-only via route guard)
 */
async function updateMovie(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json(error('BAD_REQUEST', 'Invalid movie id'));

  try {
    const updated = await prisma.movie.update({
      where: { id },
      data: req.body,
    });
    return res.json(ok(updated));
  } catch {
    return res.status(404).json(error('NOT_FOUND', 'Movie not found'));
  }
}

/**
 * DELETE /api/movies/:id (ADMIN-only via route guard)
 */
async function deleteMovie(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json(error('BAD_REQUEST', 'Invalid movie id'));

  try {
    await prisma.movie.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json(error('NOT_FOUND', 'Movie not found'));
  }
}

export { listMovies, searchMovies, getMovie, createMovie, updateMovie, deleteMovie };
export default { listMovies, searchMovies, getMovie, createMovie, updateMovie, deleteMovie };
