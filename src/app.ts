// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// IMPORTANT: no ".js" extensions so ts-jest can resolve the TS sources
import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet());

// Allow comma-separated origins via CORS_ORIGIN env (or "*")
const origins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: origins && origins.length > 0 ? origins : '*' }));

app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

// Keep health simple and consistent for tests
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', router);

// Centralized 404 + error handling
app.use(notFound);
app.use(errorHandler);

export default app;
