const express = require('express');
const reportController = require('../../controllers/admin/report.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// ─── Report Routes ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/reports/property-views
 * Query params: dateFrom, dateTo, page, limit, sortBy, sortOrder
 */
router.get('/property-views', reportController.getPropertyViewsReport);

/**
 * GET /api/v1/admin/reports/leads
 * Query params: status, formType, search, dateFrom, dateTo, page, limit
 */
router.get('/leads', reportController.getLeadConversionReport);

/**
 * GET /api/v1/admin/reports/revenue
 * Query params: period (monthly/quarterly/yearly), dateFrom, dateTo
 */
router.get('/revenue', reportController.getRevenueReport);

/**
 * GET /api/v1/admin/reports/property-analysis
 * Query params: listingType, status, city, search, page, limit
 */
router.get('/property-analysis', reportController.getPropertyAnalysisReport);

/**
 * GET /api/v1/admin/reports/customers
 * Query params: accountType, isActive, search, page, limit
 */
router.get('/customers', reportController.getCustomerActivityReport);

module.exports = router;