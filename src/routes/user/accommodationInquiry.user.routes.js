const express = require('express');
const inquiryController = require('../../controllers/user/accommodationInquiry.user.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { normalizeInquiryMultipartBody } = require('../../middlewares/inquiryBody.middleware');
const { uploadInquiryAttachments, handleMulterError } = require('../../middlewares/upload.middleware');
const { submitAccommodationInquirySchema } = require('../../validators/user/accommodationInquiry.user.validator');

const router = express.Router();

router.post(
  '/',
  uploadInquiryAttachments,
  handleMulterError,
  normalizeInquiryMultipartBody,
  validate(submitAccommodationInquirySchema),
  inquiryController.submitInquiry
);

module.exports = router;
