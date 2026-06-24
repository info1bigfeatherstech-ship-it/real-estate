const express = require('express');
const authRoutes = require('./auth.admin.routes');
const propertyRoutes = require('./property.admin.routes');
const dashboardRoutes = require('./dashboard.admin.routes');
const eliteServiceRoutes = require('./eliteService.admin.routes');
const eliteConfigRoutes = require('./eliteConfig.admin.routes');
const accommodationInquiryRoutes = require('./accommodationInquiry.admin.routes');
const inquiryAdminRoutes = require('./inquiry.admin.routes');
const customerAdminRoutes = require('./customer.admin.routes');
const inventoryItemRoutes = require('./inventoryItem.admin.routes');
const propertyViewRoutes = require('./propertyView.admin.routes');
const reportRoutes = require('./report.routes');
const generalInquiryRoutes = require('./generalInquiry.admin.routes');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/dashboard', authenticate, requireAdmin, dashboardRoutes);
router.use('/properties', authenticate, requireAdmin, propertyRoutes);
router.use('/elite-services', authenticate, requireAdmin, eliteServiceRoutes);
router.use('/elite', authenticate, requireAdmin, eliteConfigRoutes);
router.use('/accommodation-inquiries', authenticate, requireAdmin, accommodationInquiryRoutes);
router.use('/inquiries', authenticate, requireAdmin, inquiryAdminRoutes);
router.use('/customers', authenticate, requireAdmin, customerAdminRoutes);
router.use('/inventory-items', authenticate, requireAdmin, inventoryItemRoutes);
router.use('/views', authenticate, requireAdmin, propertyViewRoutes);
router.use('/reports', authenticate, requireAdmin, reportRoutes);
router.use('/general-inquiries', authenticate, requireAdmin, generalInquiryRoutes);


module.exports = router;
