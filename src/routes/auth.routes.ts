import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller';
import { authGuard } from '../middleware/auth';
const r = Router();

r.post('/register', register);
r.post('/login', login);
r.get('/me', authGuard, me);

export default r;
