const propertyViewService = require('../../services/admin/propertyView.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get all views (admin)
 */
const getAllViews = asyncHandler(async (req, res) => {
  const result = await propertyViewService.getAllViews(req.query);
  return ApiResponse.success(res, {
    message: 'Views fetched successfully',
    data: result.views,
    meta: result.meta,
  });
});

/**
 * Get property view stats (admin)
 */
const getPropertyViewStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stats = await propertyViewService.getPropertyViewStats(id);
  return ApiResponse.success(res, {
    message: 'Property view stats fetched successfully',
    data: stats,
  });
});

/**
 * Get all properties view stats (dashboard)
 */
const getAllPropertiesViewStats = asyncHandler(async (req, res) => {
  const stats = await propertyViewService.getAllPropertiesViewStats();
  return ApiResponse.success(res, {
    message: 'All properties view stats fetched successfully',
    data: stats,
  });
});

/**
 * Get viewers for a property
 */
const getPropertyViewers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const result = await propertyViewService.getPropertyViewers(id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return ApiResponse.success(res, {
    message: 'Property viewers fetched successfully',
    data: result.viewers,
    meta: result.meta,
  });
});

module.exports = {
  getAllViews,
  getPropertyViewStats,
  getAllPropertiesViewStats,
  getPropertyViewers,
};