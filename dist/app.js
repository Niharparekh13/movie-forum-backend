import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { errorHandler, notFound } from './middleware/error.js';
import router from './routes/index.js';
import reviewRouter from './routes/review.routes.js';
const app = express();
app.set('view engine', 'ejs');
app.set('views', './public');

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/reviews', reviewRouter);
app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

export default app;
