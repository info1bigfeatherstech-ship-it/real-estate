const express = require('express');
const inquiryController = require('../../controllers/admin/accommodationInquiry.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  listAccommodationInquiriesQuerySchema,
  updateAccommodationInquiryStatusSchema,
  updateAccommodationInquirySchema,
  accommodationInquiryIdParamSchema,
} = require('../../validators/admin/accommodationInquiry.admin.validator');

const router = express.Router();

router.get('/stats', inquiryController.getInquiryStats);
router.get(
  '/',
  validate(listAccommodationInquiriesQuerySchema, 'query'),
  inquiryController.listInquiries
);
router.get(
  '/:id',
  validate(accommodationInquiryIdParamSchema, 'params'),
  inquiryController.getInquiry
);
router.patch(
  '/:id/status',
  validate(accommodationInquiryIdParamSchema, 'params'),
  validate(updateAccommodationInquiryStatusSchema),
  inquiryController.updateInquiryStatus
);
router.patch(
  '/:id/notes',
  validate(accommodationInquiryIdParamSchema, 'params'),
  validate(updateAccommodationInquirySchema),
  inquiryController.updateInquiryNotes
);
router.delete(
  '/:id',
  validate(accommodationInquiryIdParamSchema, 'params'),
  inquiryController.deleteInquiry
);

module.exports = router;
