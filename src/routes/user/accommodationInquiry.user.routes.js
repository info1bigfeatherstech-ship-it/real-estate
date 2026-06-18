const express = require('express');
const inquiryController = require('../../controllers/user/accommodationInquiry.user.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');
const { normalizeInquiryMultipartBody } = require('../../middlewares/inquiryBody.middleware');
const { uploadInquiryAttachments, handleMulterError } = require('../../middlewares/upload.middleware');
const { submitAccommodationRequirementSchema } = require('../../validators/customer/inquiry.customer.validator');

const router = express.Router();

router.post(
  '/',
  authenticateCustomer,
  uploadInquiryAttachments,
  handleMulterError,
  normalizeInquiryMultipartBody,
  validate(submitAccommodationRequirementSchema),
  inquiryController.submitInquiry
);

module.exports = router;
