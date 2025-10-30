import { z } from 'zod';
export const ReviewCreateDto = z.object({
    movieId: z.number().int().positive(),
    rating: z.number().int().min(1).max(10),
    title: z.string().min(1).max(120),
    comment: z.string().min(1),
    spoiler: z.boolean().optional(),
    visibility: z.enum(['PUBLIC', 'PRIVATE']).optional()
});
export const ReviewUpdateDto = ReviewCreateDto.partial().extend({
    movieId: z.undefined()
});
