import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    // --- Admin user (idempotent) ---
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' }, // unique key
        update: {},
        create: {
            username: 'admin',
            email: 'admin@example.com',
            // bcrypt hash for 'AdminPass123!' – fine for dev
            passwordHash: await bcrypt.hash('AdminPass123!', 10),
            role: 'ADMIN',
        },
    });
    // --- One demo movie (idempotent by unique slug) ---
    const movie = await prisma.movie.upsert({
        where: { slug: 'inception-2010' }, // unique key Movie_slug_key
        update: {}, // nothing to update for seed
        create: {
            title: 'Inception',
            genre: 'Sci-Fi',
            releaseYear: 2010,
            description: 'A mind-bending thriller.',
            runtimeMin: 148,
            slug: 'inception-2010',
            createdByUserId: admin.id,
        },
    });
    // --- One review by admin (idempotent via composite unique) ---
    // Requires a unique constraint like @@unique([userId, movieId]) in your Prisma schema
    await prisma.review.upsert({
        where: { userId_movieId: { userId: admin.id, movieId: movie.id } },
        update: {
            // If you want to tweak the seed on reruns
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
    console.log('✅ Seed OK: admin, movie (inception-2010), review.');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => prisma.$disconnect());
