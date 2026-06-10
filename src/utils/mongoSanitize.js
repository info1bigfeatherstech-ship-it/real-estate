const mongoSanitize = require('express-mongo-sanitize');

/**
 * NoSQL injection defense — strips Mongo operator keys from body, params, and query.
 * Wrapped so we can swap implementation later without touching app wiring.
 */
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    if (req.log) {
      req.log.warn({ key, path: req.originalUrl }, 'Sanitized potentially malicious key');
    }
  },
});

module.exports = { mongoSanitizeMiddleware };
