const logger = require('../utils/logger');

const SHUTDOWN_TIMEOUT_MS = 10000;

class ShutdownService {
  constructor() {
    this.server = null;
    this.connections = new Map();
    this.isShuttingDown = false;
    this.handlersInstalled = false;
  }

  registerServer(httpServer) {
    this.server = httpServer;
  }

  registerConnection(name, closeFn) {
    this.connections.set(name, closeFn);
  }

  setupProcessHandlers() {
    if (this.handlersInstalled) return;
    this.handlersInstalled = true;

    process.on('SIGTERM', () => this.initiate('SIGTERM'));
    process.on('SIGINT', () => this.initiate('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.fatal({ err: reason }, 'Unhandled promise rejection');
      this.initiate('unhandledRejection');
    });

    process.on('uncaughtException', (error) => {
      logger.fatal({ err: error }, 'Uncaught exception');
      this.initiate('uncaughtException');
    });
  }

  async initiate(signal) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    logger.info({ signal }, 'Graceful shutdown initiated');

    const forceExitTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    if (typeof forceExitTimer.unref === 'function') {
      forceExitTimer.unref();
    }

    try {
      if (this.server) {
        await new Promise((resolve, reject) => {
          this.server.close((error) => (error ? reject(error) : resolve()));
        });
        logger.info('HTTP server closed');
      }

      for (const [name, closeFn] of this.connections) {
        try {
          await closeFn();
          logger.info({ connection: name }, 'Connection closed');
        } catch (error) {
          logger.error({ connection: name, err: error }, 'Failed to close connection');
        }
      }

      clearTimeout(forceExitTimer);
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.fatal({ err: error }, 'Graceful shutdown failed');
      process.exit(1);
    }
  }
}

module.exports = new ShutdownService();
