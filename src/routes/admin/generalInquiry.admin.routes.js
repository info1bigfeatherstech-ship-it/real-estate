const express = require('express');
const generalInquiryController = require('../../controllers/admin/generalInquiry.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

/**
 * GET /api/v1/admin/general-inquiries/stats
 * Get inquiry stats
 */
router.get('/stats', generalInquiryController.getStats);

/**
 * GET /api/v1/admin/general-inquiries
 * List all inquiries with filters
 * Query: page, limit, status, search, fromDate, toDate
 */
router.get('/', generalInquiryController.listInquiries);

/**
 * GET /api/v1/admin/general-inquiries/:id
 * Get single inquiry
 */
router.get('/:id', generalInquiryController.getInquiry);

/**
 * PATCH /api/v1/admin/general-inquiries/:id/status
 * Update inquiry status
 * Body: { "status": "read", "adminNotes": "..." }
 */
router.patch('/:id/status', generalInquiryController.updateStatus);

/**
 * DELETE /api/v1/admin/general-inquiries/:id
 * Delete inquiry
 */
router.delete('/:id', generalInquiryController.deleteInquiry);

module.exports = router;