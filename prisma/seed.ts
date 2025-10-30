// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const ROUNDS = 12;

async function recomputeMovieRating(movieId: number) {
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

async function main() {
  // --- Admin user (reset password hash each run) ---
  const adminHash = await bcrypt.hash('AdminPass123!', ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash: adminHash,
      role: 'ADMIN',
      username: 'admin',
    },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  // --- Regular user (for USER flows & tests) ---
  const userHash = await bcrypt.hash('User@123', ROUNDS);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      passwordHash: userHash,
      role: 'USER',
      username: 'user',
    },
    create: {
      username: 'user',
      email: 'user@example.com',
      passwordHash: userHash,
      role: 'USER',
    },
  });

  // --- Demo movie (unique by slug) ---
  const movie = await prisma.movie.upsert({
    where: { slug: 'inception-2010' },
    update: {}, // keep seed stable
    create: {
      title: 'Inception',
      genre: 'Sci-Fi',
      releaseYear: 2010,
      description: 'A mind-bending thriller.',
      runtimeMin: 148,
      slug: 'inception-2010',
      createdByUserId: admin.id,
      // averageRating/ratingCount will be recomputed after inserting reviews
    },
  });

  // --- Reviews (composite unique @@unique([userId, movieId]) required) ---
  await prisma.review.upsert({
    where: { userId_movieId: { userId: admin.id, movieId: movie.id } },
    update: {
      rating: 9,
      title: 'Brilliant',
      comment: 'Nolan at his best.',
    },
    create: {
      userId: admin.id,
      movieId: movie.id,
      rating: 9,
      title: 'Brilliant',
      comment: 'Nolan at his best.',
    },
  });

  await prisma.review.upsert({
    where: { userId_movieId: { userId: user.id, movieId: movie.id } },
    update: {
      rating: 8,
      title: 'Great watch',
      comment: 'Mind = blown.',
    },
    create: {
      userId: user.id,
      movieId: movie.id,
      rating: 8,
      title: 'Great watch',
      comment: 'Mind = blown.',
    },
  });

  // --- Recompute aggregate rating for the movie ---
  await recomputeMovieRating(movie.id);

  console.log('✅ Seed OK: admin (AdminPass123!), user (User@123), movie, reviews, aggregates updated.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
