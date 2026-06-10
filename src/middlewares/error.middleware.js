const AppError = require('../errors/AppError');
const { HTTP_STATUS, ERROR_CODES } = require('../errors/errorCodes');
const env = require('../config/env');
const logger = require('../utils/logger');

const notFoundHandler = (req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_ERROR;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Invalid resource identifier';
  }

  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    errorCode = ERROR_CODES.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled server error');
  }

  const payload = {
    success: false,
    errorCode,
    message,
    requestId: req.id,
  };

  if (details) payload.details = details;

  if (env.isDevelopment && statusCode >= 500 && err.stack) {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
};

module.exports = { notFoundHandler, errorHandler };
