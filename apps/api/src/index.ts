import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRouter from './routes/auth';
import filmsRouter from './routes/films';
import seriesRouter from './routes/series';
import logsRouter from './routes/logs';
import usersRouter from './routes/users';
import reviewsRouter from './routes/reviews';
import aiRouter from './routes/ai';
import watchlistRouter from './routes/watchlist';
import commentsRouter from './routes/comments';
import collectionsRouter from './routes/collections';
import ratingsRouter from './routes/ratings';
import activityRouter from './routes/activity';
import notificationsRouter from './routes/notifications';
import achievementsRouter from './routes/achievements';
import recommendationsRouter from './routes/recommendations';
import dashboardRouter from './routes/dashboard';
import discoveryRouter from './routes/discovery';
import statsRouter from './routes/stats';
import adminRouter from './routes/admin';
import reportsRouter from './routes/reports';
import settingsRouter from './routes/settings';

import { rateLimiter } from './middleware/rateLimiter';

// "?"? BigInt JSON Serialization Polyfill
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();

// ── Security & Performance ────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(rateLimiter);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── Body & Cookie Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/films', filmsRouter);
app.use('/api/v1/series', seriesRouter);
app.use('/api/v1/logs', logsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/watchlist', watchlistRouter);
app.use('/api/v1/comments', commentsRouter);
app.use('/api/v1/collections', collectionsRouter);
app.use('/api/v1/ratings', ratingsRouter);
app.use('/api/v1/activity', activityRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/achievements', achievementsRouter);
app.use('/api/v1/recommendations', recommendationsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/discovery', discoveryRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/settings', settingsRouter);

// ── 404 & Error Handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

function logDatabaseDiagnostic() {
  const rawUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL runtime diagnostic:');
  if (!rawUrl) {
    console.log('- PRESENT: NO');
    console.log('- PROTOCOL: INVALID');
    console.log('- HOST: MISSING');
    console.log('- PORT: default');
    console.log('- IS_LOCALHOST: NO');
    console.log('- HAS_LEADING_QUOTE: NO');
    console.log('- HAS_TRAILING_QUOTE: NO');
    console.log('- LENGTH: 0');
  } else {
    console.log('- PRESENT: YES');
    const hasLeading = rawUrl.startsWith('"') || rawUrl.startsWith("'");
    const hasTrailing = rawUrl.endsWith('"') || rawUrl.endsWith("'");
    const unquoted = hasLeading && hasTrailing ? rawUrl.slice(1, -1) : rawUrl;
    try {
      const parsed = new URL(unquoted);
      console.log(`- PROTOCOL: ${parsed.protocol}`);
      console.log(`- HOST: ${parsed.hostname || 'MISSING'}`);
      console.log(`- PORT: ${parsed.port || 'default'}`);
      console.log(`- IS_LOCALHOST: ${parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' ? 'YES' : 'NO'}`);
    } catch {
      console.log('- PROTOCOL: INVALID');
      console.log('- HOST: MISSING');
      console.log('- PORT: default');
      console.log('- IS_LOCALHOST: NO');
    }
    console.log(`- HAS_LEADING_QUOTE: ${hasLeading ? 'YES' : 'NO'}`);
    console.log(`- HAS_TRAILING_QUOTE: ${hasTrailing ? 'YES' : 'NO'}`);
    console.log(`- LENGTH: ${rawUrl.length}`);
  }

  try {
    const configUrl = new URL(config.databaseUrl);
    console.log('Prisma datasource override: ENABLED');
    console.log(`Prisma database host: ${configUrl.hostname}`);
    console.log(`Prisma database port: ${configUrl.port || 'default'}`);
  } catch {
    console.log('Prisma datasource override: ENABLED (unparseable)');
  }
}

// ── Server Startup ────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    logDatabaseDiagnostic();
    await prisma.$connect().catch((err) => console.warn('⚠️ PostgreSQL connection deferred:', err.message));
    await redis.ping().catch((err) => console.warn('⚠️ Redis connection deferred:', err.message));

    app.listen(config.port, () => {
      console.log(`🚀 CineVault API running on http://localhost:${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
}

bootstrap();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});
