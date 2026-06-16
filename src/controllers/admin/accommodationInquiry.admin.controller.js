const inquiryService = require('../../services/admin/accommodationInquiry.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listInquiries = asyncHandler(async (req, res) => {
  const result = await inquiryService.listInquiries(req.query);
  return ApiResponse.success(res, {
    message: 'Accommodation inquiries fetched successfully',
    data: result.inquiries,
    meta: result.meta,
  });
});

const getInquiryStats = asyncHandler(async (req, res) => {
  const stats = await inquiryService.getInquiryStats();
  return ApiResponse.success(res, {
    message: 'Accommodation inquiry stats fetched successfully',
    data: stats,
  });
});

const getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.getInquiryById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Accommodation inquiry fetched successfully',
    data: inquiry,
  });
});

const updateInquiryStatus = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.updateInquiryStatus(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, {
    message: 'Accommodation inquiry status updated successfully',
    data: inquiry,
  });
});

const updateInquiryNotes = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.updateInquiryNotes(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, {
    message: 'Accommodation inquiry notes updated successfully',
    data: inquiry,
  });
});

const deleteInquiry = asyncHandler(async (req, res) => {
  await inquiryService.deleteInquiry(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: 'Accommodation inquiry deleted successfully' });
});

module.exports = {
  listInquiries,
  getInquiryStats,
  getInquiry,
  updateInquiryStatus,
  updateInquiryNotes,
  deleteInquiry,
};
