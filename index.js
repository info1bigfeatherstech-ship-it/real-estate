/**
 * index.js — Application entry point.
 *
 * 1. Load .env / .env.local from the backend root BEFORE any config module runs.
 * 2. Install temporary boot-time error handlers (removed once shutdown service takes over).
 * 3. Delegate startup to server.js via startApplication().
 *
 * package.json "main" and "start"/"dev" scripts must point here.
 */

const path = require('path');
const { loadEnv } = require('./src/bootstrap/loadEnv');

loadEnv(path.join(__dirname));

const bootUncaughtHandler = (error) => {
  // eslint-disable-next-line no-console
  console.error('[Boot] Uncaught exception before server bootstrap:', error);
  process.exit(1);
};

const bootRejectionHandler = (reason) => {
  // eslint-disable-next-line no-console
  console.error('[Boot] Unhandled rejection before server bootstrap:', reason);
  process.exit(1);
};

process.on('uncaughtException', bootUncaughtHandler);
process.on('unhandledRejection', bootRejectionHandler);

const { app, startApplication, gracefulShutdown } = require('./server');

process.off('uncaughtException', bootUncaughtHandler);
process.off('unhandledRejection', bootRejectionHandler);

startApplication();

module.exports = { app, gracefulShutdown };
