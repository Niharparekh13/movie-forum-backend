// src/validators/movie.dto.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

// Strict schema for create; update is partial of this
export const movieCreateSchema = z.object({
  title: z.string().min(1, 'title is required'),
  genre: z.string().min(1, 'genre is required'),
  releaseYear: z.number().int().min(1900).max(2100),
  description: z.string().min(1),
  runtimeMin: z.number().int().min(1),
  isPublic: z.boolean().optional(),
  posterUrl: z.string().url().optional().nullable()
});

export const movieUpdateSchema = movieCreateSchema.partial();

// ---- Aliases for compatibility with existing imports ----
export const CreateMovieDto = movieCreateSchema;
export const UpdateMovieDto = movieUpdateSchema;

// Optional TS types if you want them in controllers
export type CreateMovieInput = z.infer<typeof movieCreateSchema>;
export type UpdateMovieInput = z.infer<typeof movieUpdateSchema>;

/** Middleware: POST uses create schema, PUT/PATCH uses update schema. */
export function validateMovie(req: Request, res: Response, next: NextFunction) {
  const isCreate = req.method.toUpperCase() === 'POST';
  const schema = isCreate ? movieCreateSchema : movieUpdateSchema;
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(422)
      .json(error('VALIDATION_ERROR', 'Invalid movie payload', parsed.error.flatten()));
  }
  req.body = parsed.data;
  next();
}
