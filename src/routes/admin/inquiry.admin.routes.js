const express = require('express');
const inquiryController = require('../../controllers/admin/inquiry.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  listInquiriesQuerySchema,
  inquiryStatsQuerySchema,
  inquiryIdParamSchema,
  updateInquirySchema,
} = require('../../validators/admin/inquiry.admin.validator');

const router = express.Router();

router.get('/stats', validate(inquiryStatsQuerySchema, 'query'), inquiryController.getInquiryStats);
router.get('/', validate(listInquiriesQuerySchema, 'query'), inquiryController.listInquiries);
router.get('/:id', validate(inquiryIdParamSchema, 'params'), inquiryController.getInquiry);
router.patch(
  '/:id',
  validate(inquiryIdParamSchema, 'params'),
  validate(updateInquirySchema),
  inquiryController.updateInquiry
);
router.delete('/:id', validate(inquiryIdParamSchema, 'params'), inquiryController.deleteInquiry);

module.exports = router;
