const inquiryService = require('../../services/customer/inquiry.customer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const submitInquiry = asyncHandler(async (req, res) => {
  const result = await inquiryService.submitInquiry(
    req.params.formType,
    req.body,
    req.customer,
    req.files || {}
  );

  return ApiResponse.created(res, req.body.saveAsDraft ? 'Inquiry saved as draft' : 'Inquiry submitted successfully', result);
});

const listMyInquiries = asyncHandler(async (req, res) => {
  const result = await inquiryService.listMyInquiries(req.customer._id, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    formType: req.query.formType,
  });

  return ApiResponse.success(res, {
    message: 'Inquiries fetched successfully',
    data: result.inquiries,
    meta: result.meta,
  });
});

module.exports = { submitInquiry, listMyInquiries };
