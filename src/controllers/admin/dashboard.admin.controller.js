const dashboardService = require('../../services/admin/dashboard.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getStats = asyncHandler(async (_req, res) => {
  const stats = await dashboardService.getDashboardStats();
  return ApiResponse.success(res, { message: 'Dashboard stats fetched successfully', data: stats });
});

module.exports = { getStats };
