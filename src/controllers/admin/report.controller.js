const reportService = require('../../services/admin/report.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// ─── 1. PROPERTY VIEWS REPORT ─────────────────────────────────────────────

const getPropertyViewsReport = asyncHandler(async (req, res) => {
  const result = await reportService.getPropertyViewsReport(req.query);
  return ApiResponse.success(res, {
    message: 'Property views report fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

// ─── 2. LEAD CONVERSION REPORT ────────────────────────────────────────────

const getLeadConversionReport = asyncHandler(async (req, res) => {
  const result = await reportService.getLeadConversionReport(req.query);
  return ApiResponse.success(res, {
    message: 'Lead conversion report fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

// ─── 3. REVENUE REPORT ────────────────────────────────────────────────────

const getRevenueReport = asyncHandler(async (req, res) => {
  const result = await reportService.getRevenueReport(req.query);
  return ApiResponse.success(res, {
    message: 'Revenue report fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

// ─── 4. PROPERTY ANALYSIS REPORT ──────────────────────────────────────────

const getPropertyAnalysisReport = asyncHandler(async (req, res) => {
  const result = await reportService.getPropertyAnalysisReport(req.query);
  return ApiResponse.success(res, {
    message: 'Property analysis report fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

// ─── 5. CUSTOMER ACTIVITY REPORT ─────────────────────────────────────────

const getCustomerActivityReport = asyncHandler(async (req, res) => {
  const result = await reportService.getCustomerActivityReport(req.query);
  return ApiResponse.success(res, {
    message: 'Customer activity report fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

// ─── EXPORT ────────────────────────────────────────────────────────────────

module.exports = {
  getPropertyViewsReport,
  getLeadConversionReport,
  getRevenueReport,
  getPropertyAnalysisReport,
  getCustomerActivityReport,
};