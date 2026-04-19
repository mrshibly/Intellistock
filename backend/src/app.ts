import express, { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './app.router';

const app = express();

// 1. Sentry Init (Must be first)
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [
      // Sentry 10 uses automatic integrations
    ],
  });
}

// 2. Security & Parsers
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// app.use(mongoSanitize());

// 3. Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// 5. Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 6. Routes
app.use('/api/v1', apiRouter);

// 7. Sentry Error Handler (Must be after all routes, before other error handlers)
if (env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// 8. 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// 9. Central Error Handler
app.use(errorHandler);

export default app;
