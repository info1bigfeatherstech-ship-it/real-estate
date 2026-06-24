const express = require('express');
const generalInquiryController = require('../../controllers/user/generalInquiry.user.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { createGeneralInquirySchema } = require('../../validators/user/generalInquiry.user.validator');

const router = express.Router();

/**
 * POST /api/v1/user/general-inquiries
 * Submit a general inquiry (no auth required)
 */
router.post(
  '/',
  validate(createGeneralInquirySchema),
  generalInquiryController.createInquiry
);

/**
 * GET /api/v1/user/general-inquiries/:id
 * Get inquiry status (optional, no auth)
 */
router.get('/:id', generalInquiryController.getInquiry);

module.exports = router;