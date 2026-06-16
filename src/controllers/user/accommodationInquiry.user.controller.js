const inquiryService = require('../../services/user/accommodationInquiry.user.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const submitInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.submitInquiry(req.body, req.files);
  const message = req.body.saveAsDraft
    ? 'Accommodation inquiry draft saved successfully'
    : 'Accommodation inquiry submitted successfully';

  return ApiResponse.created(res, message, inquiry);
});

module.exports = {
  submitInquiry,
};
