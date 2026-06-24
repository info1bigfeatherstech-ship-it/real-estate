const express = require('express');
const propertyViewController = require('../../controllers/user/propertyView.user.controller');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');

const router = express.Router();

// ─── Public Routes (No Auth Required) ────────────────────────────────────

/**
 * Track property view
 * POST /api/v1/user/properties/:id/view
 */
router.post('/:id/view', propertyViewController.trackView);

/**
 * Get view count for a property
 * GET /api/v1/user/properties/:id/views/count
 */
router.get('/:id/views/count', propertyViewController.getViewCount);

/**
 * Get active viewers (FOMO)
 * GET /api/v1/user/properties/:id/views/active
 */
router.get('/:id/views/active', propertyViewController.getActiveViewers);

// ─── Admin Routes (Auth Required) ────────────────────────────────────────

/**
 * Get view history (Admin only - will be in admin routes)
 * But we keep it here with auth check
 */
router.get('/:id/views/history', authenticateCustomer, propertyViewController.getViewHistory);

module.exports = router;