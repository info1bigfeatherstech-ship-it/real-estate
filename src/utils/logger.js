const pino = require('pino');
const env = require('../config/env');

const logger = pino({
  level: env.isProduction ? 'info' : 'debug',
  transport: env.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  redact: {
    paths: ['req.headers.authorization', 'password', 'token', 'refreshToken'],
    remove: true,
  },
});

module.exports = logger;
