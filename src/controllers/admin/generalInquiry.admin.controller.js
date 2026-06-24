const generalInquiryService = require('../../services/admin/generalInquiry.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── List Inquiries ──────────────────────────────────────────────────────
const listInquiries = asyncHandler(async (req, res) => {
  const result = await generalInquiryService.listInquiries(req.query);
  return ApiResponse.success(res, {
    message: 'Inquiries fetched successfully',
    data: result.inquiries,
    meta: result.meta,
  });
});

// ─── Get Single Inquiry ──────────────────────────────────────────────────
const getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await generalInquiryService.getInquiryById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Inquiry fetched successfully',
    data: inquiry,
  });
});

// ─── Get Stats ──────────────────────────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const stats = await generalInquiryService.getInquiryStats();
  return ApiResponse.success(res, {
    message: 'Inquiry stats fetched successfully',
    data: stats,
  });
});

// ─── Update Status ──────────────────────────────────────────────────────
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { adminNotes } = req.body;

  if (!status) {
    throw AppError.badRequest('Status is required');
  }

  const inquiry = await generalInquiryService.updateInquiryStatus(
    req.params.id,
    status,
    adminNotes
  );

  return ApiResponse.success(res, {
    message: 'Inquiry status updated successfully',
    data: inquiry,
  });
});

// ─── Delete Inquiry ──────────────────────────────────────────────────────
const deleteInquiry = asyncHandler(async (req, res) => {
  await generalInquiryService.deleteInquiry(req.params.id);
  return ApiResponse.success(res, {
    message: 'Inquiry deleted successfully',
  });
});

module.exports = {
  listInquiries,
  getInquiry,
  getStats,
  updateStatus,
  deleteInquiry,
};