const express = require('express');
const propertyViewController = require('../../controllers/admin/propertyView.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

/**
 * Get all views with filters
 * GET /api/v1/admin/views
 */
router.get('/', propertyViewController.getAllViews);

/**
 * Get all properties view stats (dashboard)
 * GET /api/v1/admin/views/stats
 */
router.get('/stats', propertyViewController.getAllPropertiesViewStats);

/**
 * Get property view stats
 * GET /api/v1/admin/views/property/:id/stats
 */
router.get('/property/:id/stats', propertyViewController.getPropertyViewStats);

/**
 * Get viewers for a property
 * GET /api/v1/admin/views/property/:id/viewers
 */
router.get('/property/:id/viewers', propertyViewController.getPropertyViewers);

module.exports = router;