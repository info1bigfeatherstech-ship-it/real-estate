const propertyViewService = require('../../services/user/propertyView.user.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get view count for a property
 */
const getViewCount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { unique } = req.query;

  const result = await propertyViewService.getViewCount(id, unique === 'true');
  return ApiResponse.success(res, {
    message: 'View count fetched successfully',
    data: result,
  });
});

/**
 * Get active viewers count (last 30 minutes)
 */
const getActiveViewers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const count = await propertyViewService.getActiveViewersCount(id);
  return ApiResponse.success(res, {
    message: 'Active viewers count fetched successfully',
    data: { propertyId: id, activeViewers: count },
  });
});

/**
 * Get view history for a property
 */
const getViewHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const result = await propertyViewService.getViewHistory(id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return ApiResponse.success(res, {
    message: 'View history fetched successfully',
    data: result.views,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    },
  });
});

/**
 * Track property view (called from public API)
 */
const trackView = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const viewerInfo = {
    viewerId: req.customer?._id || null,
    viewerType: req.customer?.accountType || 'guest',
    viewerName: req.customer?.fullName || null,
    viewerMobile: req.customer?.mobile || null,
    viewerEmail: req.customer?.email || null,
    sessionId: req.cookies?.sessionId || req.headers['x-session-id'] || null,
    ipAddress: req.ip || req.headers['x-forwarded-for']?.split(',')[0] || null,
    userAgent: req.headers['user-agent'] || null,
    referrer: req.headers['referer'] || req.headers['referrer'] || null,
    source: req.query.source || 'direct',
  };

  const view = await propertyViewService.trackView(id, viewerInfo);
  return ApiResponse.success(res, {
    message: 'View tracked successfully',
    data: {
      propertyId: id,
      isUnique: view.isUnique,
      viewedAt: view.viewedAt,
    },
  });
});

module.exports = {
  getViewCount,
  getActiveViewers,
  getViewHistory,
  trackView,
};