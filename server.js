/**
 * server.js — Builds the Express app and exposes startApplication().
 *
 * No side-effects at import time except constructing the app instance.
 * index.js loads environment variables first, then calls startApplication().
 */

const { createApp } = require('./src/app/createApp');
const env = require('./src/config/env');
const { connectDB, disconnectDB, setupMongoDBEventHandlers } = require('./src/config/db');
const { ensureDirectories } = require('./src/bootstrap/ensureDirectories');
const { validateStartupConfig } = require('./src/bootstrap/validateStartup');
const gracefulShutdown = require('./src/services/shutdown.service');
const logger = require('./src/utils/logger');

const app = createApp();
let server = null;

const startApplication = async () => {
  try {
    logger.info(
      {
        nodeEnv: env.nodeEnv,
        nodeVersion: process.version,
        apiPrefix: env.apiPrefix,
        mediaProvider: env.media.storageProvider,
      },
      'Starting EstateAdmin API'
    );

    ensureDirectories();
    validateStartupConfig();

    if (env.media.storageProvider === 'cloudinary') {
      const { initCloudinary } = require('./src/config/cloudinary.config');
      initCloudinary();
    }

    await connectDB();
    setupMongoDBEventHandlers();

    server = app.listen(env.port, () => {
      logger.info('='.repeat(60));
      logger.info({ port: env.port, env: env.nodeEnv }, 'Server running');
      logger.info(`Health:  http://localhost:${env.port}/health`);
      logger.info(`API:     http://localhost:${env.port}${env.apiPrefix}`);
      logger.info('='.repeat(60));
    });

    gracefulShutdown.registerServer(server);
    gracefulShutdown.registerConnection('MongoDB', disconnectDB);
    gracefulShutdown.setupProcessHandlers();
  } catch (error) {
    logger.fatal({ err: error }, 'Application startup failed');
    process.exit(1);
  }
};

module.exports = {
  app,
  startApplication,
  gracefulShutdown,
};
