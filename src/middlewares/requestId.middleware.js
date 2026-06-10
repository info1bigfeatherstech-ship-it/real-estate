const crypto = require('crypto');

const buildRequestId = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}`;
};

const sanitizeIncomingRequestId = (value) => {
  const candidate = String(value || '').trim();
  if (!candidate || candidate.length > 128) return '';
  return /^[A-Za-z0-9._:-]+$/.test(candidate) ? candidate : '';
};

const requestIdMiddleware = (req, res, next) => {
  const incomingId = sanitizeIncomingRequestId(req.headers['x-request-id']);
  req.id = incomingId || buildRequestId();
  res.setHeader('X-Request-ID', req.id);
  next();
};

const setOperationalNoCacheHeaders = (res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};

module.exports = { requestIdMiddleware, setOperationalNoCacheHeaders };
