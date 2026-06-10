const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');

const env = require('../config/env');
const logger = require('../utils/logger');
const routes = require('../routes/index.routes');
const healthController = require('../controllers/health.controller');
const { globalRateLimiter } = require('../middlewares/rateLimiter.middleware');
const { notFoundHandler, errorHandler } = require('../middlewares/error.middleware');
const { requestIdMiddleware } = require('../middlewares/requestId.middleware');
const { mongoSanitizeMiddleware } = require('../utils/mongoSanitize');

const createApp = () => {
  const app = express();

  app.set('trust proxy', env.trustProxy);
  logger.info({ trustProxy: env.trustProxy }, 'Express trust proxy configured');

  // ── Observability ──────────────────────────────────────────────────────────
  app.use(requestIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      autoLogging: env.isProduction,
      customProps: (req) => ({ requestId: req.id }),
      customLogLevel(_req, res, err) {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  // ── Security ───────────────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (env.corsOrigins.includes(origin)) return callback(null, true);
        if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    })
  );

  // ── Body parsing & compression ─────────────────────────────────────────────
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(mongoSanitizeMiddleware);

  // ── Rate limiting ──────────────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ── Static uploads ─────────────────────────────────────────────────────────
  app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

  // ── Health probes (no auth, no rate limit) ─────────────────────────────────
  app.get('/health/live', healthController.liveness);
  app.get('/health/ready', healthController.readiness);
  app.get('/health', healthController.health);

  // ── API routes ─────────────────────────────────────────────────────────────
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'EstateAdmin API Server',
      version: '1.0.0',
      health: '/health',
      api: env.apiPrefix,
    });
  });

  app.use(env.apiPrefix, routes);

  // ── Error handling (must be last) ──────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
