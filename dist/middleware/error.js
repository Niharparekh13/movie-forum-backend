import { error } from '../utils/response.js';
function notFound(req, res) {
    return res.status(404).json(error('NOT_FOUND', 'Route not found'));
}
function errorHandler(err, req, res, _next) {
    const status = err.status ?? 500;
    const message = err.message ?? 'Internal server error';
    const details = err.details;
    if (process.env.NODE_ENV !== 'test') {
        console.error(err);
    }
    return res.status(status).json(error('INTERNAL_ERROR', message, details));
}
// explicit named + default exports so TS/Jest/ESM are all happy
export { notFound, errorHandler };
export default { notFound, errorHandler };
