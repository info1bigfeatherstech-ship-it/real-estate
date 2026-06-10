const mongoose = require('mongoose');
const { setOperationalNoCacheHeaders } = require('../middlewares/requestId.middleware');

const getDatabaseStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

const liveness = (req, res) => {
  setOperationalNoCacheHeaders(res);
  res.status(200).json({
    success: true,
    code: 'SERVICE_ALIVE',
    status: 'alive',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
};

const readiness = (req, res) => {
  setOperationalNoCacheHeaders(res);

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      code: 'SERVICE_NOT_READY',
      status: 'not_ready',
      reason: 'database_not_connected',
      requestId: req.id,
    });
  }

  return res.status(200).json({
    success: true,
    code: 'SERVICE_READY',
    status: 'ready',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
};

const health = (req, res) => {
  setOperationalNoCacheHeaders(res);

  const dbConnected = mongoose.connection.readyState === 1;
  const memUsage = process.memoryUsage();

  const payload = {
    success: dbConnected,
    code: dbConnected ? 'SERVICE_HEALTH_OK' : 'SERVICE_HEALTH_DEGRADED',
    status: dbConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    requestId: req.id,
    services: {
      mongodb: getDatabaseStatus(),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      },
    },
  };

  return res.status(dbConnected ? 200 : 503).json(payload);
};

module.exports = { liveness, readiness, health };
