const agentBadgeService = require('../../services/customer/agentBadge.customer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── Get My Badge ──────────────────────────────────────────────────────────
const getMyBadge = asyncHandler(async (req, res) => {
  const badge = await agentBadgeService.getAgentBadge(req.customer._id);
  return ApiResponse.success(res, {
    message: 'Badge fetched successfully',
    data: badge,
  });
});

// ─── Get My Badge History ──────────────────────────────────────────────────
const getMyBadgeHistory = asyncHandler(async (req, res) => {
  const history = await agentBadgeService.getBadgeHistory(req.customer._id);
  return ApiResponse.success(res, {
    message: 'Badge history fetched successfully',
    data: history,
  });
});

// ─── Increment Deal Count (Internal use) ──────────────────────────────────
const incrementDealCount = asyncHandler(async (req, res) => {
  const { dealType } = req.body;
  const result = await agentBadgeService.incrementDealCount(req.customer._id, {
    propertyId: req.params.propertyId,
    dealType,
  });
  return ApiResponse.success(res, {
    message: 'Deal count incremented successfully',
    data: result,
  });
});

// ─── Get Leaderboard ──────────────────────────────────────────────────────
const getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const leaderboard = await agentBadgeService.getLeaderboard(parseInt(limit));
  return ApiResponse.success(res, {
    message: 'Leaderboard fetched successfully',
    data: leaderboard,
  });
});

module.exports = {
  getMyBadge,
  getMyBadgeHistory,
  incrementDealCount,
  getLeaderboard,
};