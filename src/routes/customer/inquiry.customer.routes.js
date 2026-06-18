const express = require('express');
const inquiryController = require('../../controllers/customer/inquiry.customer.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');
const { normalizeInquiryMultipartBody } = require('../../middlewares/inquiryBody.middleware');
const {
  uploadFlexibleInquiryAttachments,
  handleMulterError,
} = require('../../middlewares/upload.middleware');
const {
  formTypeParamSchema,
  FORM_TYPE_VALIDATORS,
} = require('../../validators/customer/inquiry.customer.validator');

const router = express.Router();

router.use(authenticateCustomer);

router.get('/', inquiryController.listMyInquiries);

router.post(
  '/:formType',
  validate(formTypeParamSchema, 'params'),
  uploadFlexibleInquiryAttachments,
  handleMulterError,
  normalizeInquiryMultipartBody,
  (req, _res, next) => {
    const schema = FORM_TYPE_VALIDATORS[req.params.formType];
    if (!schema) {
      const AppError = require('../../errors/AppError');
      return next(AppError.badRequest('Invalid form type'));
    }
    return validate(schema)(req, _res, next);
  },
  inquiryController.submitInquiry
);

module.exports = router;
