import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { error } from '../utils/response.js';
function authGuard(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json(error('UNAUTHORIZED', 'Missing bearer token'));
    }
    try {
        const token = header.substring(7);
        const payload = jwt.verify(token, config.jwtSecret);
        req.user = payload;
        return next();
    }
    catch {
        return res.status(401).json(error('UNAUTHORIZED', 'Invalid or expired token'));
    }
}
function requireRole(role) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || user.role !== role) {
            return res.status(403).json(error('FORBIDDEN', 'Insufficient privileges'));
        }
        next();
    };
}
// explicit named + default exports (helps ESM/Jest/TS interop)
export { authGuard, requireRole };
export default { authGuard, requireRole };
