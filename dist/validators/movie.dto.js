import { z } from 'zod';
export const CreateMovieDto = z.object({
    title: z.string().min(1),
    genre: z.string().min(1),
    releaseYear: z.number().int().min(1888).max(3000),
    description: z.string().min(1),
    runtimeMin: z.number().int().positive(),
    isPublic: z.boolean().optional().default(true),
    posterUrl: z.string().url().optional(),
    imdbId: z.string().optional()
});
