const inquiryService = require('../../services/customer/inquiry.customer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

const submitInquiry = asyncHandler(async (req, res) => {
  if (req.customer.accountType !== 'seeker') {
    throw AppError.forbidden('Only property seekers can submit accommodation requirement inquiries');
  }

  const result = await inquiryService.submitInquiry(
    'accommodation_requirement',
    req.body,
    req.customer,
    req.files || {}
  );

  const message = req.body.saveAsDraft
    ? 'Accommodation inquiry draft saved successfully'
    : 'Accommodation inquiry submitted successfully';

  return ApiResponse.created(res, message, result);
});

module.exports = {
  submitInquiry,
};
