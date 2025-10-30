import { prisma } from '../db/clients.js';
import { ReviewCreateDto, ReviewUpdateDto } from '../validators/review.dto.js';
import { error, ok } from '../utils/response.js';
/** Recalculate and store movie aggregate rating fields */
async function recomputeMovieRating(movieId) {
    const agg = await prisma.review.aggregate({
        where: { movieId },
        _avg: { rating: true },
        _count: { rating: true },
    });
    await prisma.movie.update({
        where: { id: movieId },
        data: {
            averageRating: agg._avg.rating ?? 0,
            ratingCount: agg._count.rating,
        },
    });
}
/** GET /api/reviews/movie/:movieId  – list all reviews for a movie */
export async function listReviewsByMovie(req, res) {
    const movieId = Number(req.params.movieId);
    if (!Number.isFinite(movieId)) {
        return res.status(400).json(error('BAD_REQUEST', 'Invalid movie id'));
    }
    const reviews = await prisma.review.findMany({
        where: { movieId },
        orderBy: { id: 'asc' },
    });
    return res.status(200).json(ok(reviews));
}
/** POST /api/reviews  – create a review (auth required) */
export async function createReview(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json(error('UNAUTHORIZED', 'Missing user'));
    }
    const parsed = ReviewCreateDto.safeParse({
        ...req.body,
        movieId: Number(req.body?.movieId),
    });
    if (!parsed.success) {
        return res
            .status(422)
            .json(error('VALIDATION_ERROR', 'Invalid input', parsed.error.issues));
    }
    try {
        const review = await prisma.review.create({
            data: { ...parsed.data, userId },
        });
        await recomputeMovieRating(parsed.data.movieId);
        return res
            .status(201)
            .location(`/api/reviews/${review.id}`)
            .json(ok(review));
    }
    catch (e) {
        // Unique on (userId, movieId) -> one review per user/movie
        if (e?.code === 'P2002') {
            return res
                .status(409)
                .json(error('CONFLICT', 'You already reviewed this movie'));
        }
        return res.status(400).json(error('BAD_REQUEST', 'Could not create review'));
    }
}
/** PUT /api/reviews/:id  – update a review (owner only) */
export async function updateReview(req, res) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json(error('BAD_REQUEST', 'Invalid review id'));
    }
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json(error('UNAUTHORIZED', 'Missing user'));
    }
    const parsed = ReviewUpdateDto.safeParse(req.body);
    if (!parsed.success) {
        return res
            .status(422)
            .json(error('VALIDATION_ERROR', 'Invalid input', parsed.error.issues));
    }
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json(error('NOT_FOUND', 'Review not found'));
    }
    if (existing.userId !== userId) {
        return res.status(403).json(error('FORBIDDEN', 'Not your review'));
    }
    const review = await prisma.review.update({
        where: { id },
        data: parsed.data,
    });
    await recomputeMovieRating(review.movieId);
    return res.status(200).json(ok(review));
}
/** DELETE /api/reviews/:id  – delete a review (owner only) */
export async function deleteReview(req, res) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json(error('BAD_REQUEST', 'Invalid review id'));
    }
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json(error('UNAUTHORIZED', 'Missing user'));
    }
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json(error('NOT_FOUND', 'Review not found'));
    }
    if (existing.userId !== userId) {
        return res.status(403).json(error('FORBIDDEN', 'Not your review'));
    }
    const deleted = await prisma.review.delete({ where: { id } });
    await recomputeMovieRating(deleted.movieId);
    return res.status(204).send();
}
