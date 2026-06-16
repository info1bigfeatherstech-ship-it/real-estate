const express = require('express');
const authRoutes = require('./auth.admin.routes');
const propertyRoutes = require('./property.admin.routes');
const dashboardRoutes = require('./dashboard.admin.routes');
const eliteServiceRoutes = require('./eliteService.admin.routes');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/dashboard', authenticate, requireAdmin, dashboardRoutes);
router.use('/properties', authenticate, requireAdmin, propertyRoutes);
router.use('/elite-services', authenticate, requireAdmin, eliteServiceRoutes);

module.exports = router;
