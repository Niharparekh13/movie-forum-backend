import { NextFunction, Request, Response } from 'express';
import { error } from '../utils/response';

export function notFound(_req: Request, res: Response) {
  return res.status(404).json(error('NOT_FOUND', 'Route not found'));
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status ?? 500;
  const message = err?.message ?? 'Internal server error';
  const details = err?.details;

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return res.status(status).json(error('INTERNAL_ERROR', message, details));
}

export default { notFound, errorHandler };
