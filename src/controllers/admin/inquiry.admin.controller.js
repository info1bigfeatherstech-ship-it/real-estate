const inquiryService = require('../../services/admin/inquiry.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getInquiryStats = asyncHandler(async (req, res) => {
  const stats = await inquiryService.getInquiryStats(req.query);
  return ApiResponse.success(res, { message: 'Inquiry stats fetched', data: stats });
});

const listInquiries = asyncHandler(async (req, res) => {
  const result = await inquiryService.listInquiries(req.query);
  return ApiResponse.success(res, {
    message: 'Inquiries fetched successfully',
    data: result.inquiries,
    meta: result.meta,
  });
});

const getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.getInquiryById(req.params.id);
  return ApiResponse.success(res, { message: 'Inquiry fetched successfully', data: inquiry });
});

const updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.updateInquiry(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Inquiry updated successfully', data: inquiry });
});

const deleteInquiry = asyncHandler(async (req, res) => {
  await inquiryService.deleteInquiry(req.params.id);
  return ApiResponse.success(res, { message: 'Inquiry deleted successfully' });
});

module.exports = {
  getInquiryStats,
  listInquiries,
  getInquiry,
  updateInquiry,
  deleteInquiry,
};
