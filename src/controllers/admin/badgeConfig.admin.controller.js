const badgeConfigService = require('../../services/admin/badgeConfig.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── Get Badge Config ──────────────────────────────────────────────────────
const getConfig = asyncHandler(async (req, res) => {
  const config = await badgeConfigService.getConfig();
  return ApiResponse.success(res, {
    message: 'Badge configuration fetched successfully',
    data: config,
  });
});

// ─── Update Full Config ────────────────────────────────────────────────────
const updateConfig = asyncHandler(async (req, res) => {
  const { tiers } = req.body;
  const config = await badgeConfigService.updateConfig(tiers, req.user._id);
  return ApiResponse.success(res, {
    message: 'Badge configuration updated successfully',
    data: config,
  });
});

// ─── Add New Tier ──────────────────────────────────────────────────────────
const addTier = asyncHandler(async (req, res) => {
  const config = await badgeConfigService.addTier(req.body, req.user._id);
  return ApiResponse.created(res, {
    message: `Tier "${req.body.name}" added successfully`,
    data: config,
  });
});

// ─── Update Tier ────────────────────────────────────────────────────────────
const updateTier = asyncHandler(async (req, res) => {
  const { level } = req.params;
  const config = await badgeConfigService.updateTier(level, req.body, req.user._id);
  return ApiResponse.success(res, {
    message: `Tier updated successfully`,
    data: config,
  });
});

// ─── Delete Tier ────────────────────────────────────────────────────────────
const deleteTier = asyncHandler(async (req, res) => {
  const { level } = req.params;
  const config = await badgeConfigService.deleteTier(level, req.user._id);
  return ApiResponse.success(res, {
    message: `Tier deleted successfully`,
    data: config,
  });
});

// ─── Toggle Tier Status ────────────────────────────────────────────────────
const toggleTierStatus = asyncHandler(async (req, res) => {
  const { level } = req.params;
  const { isActive } = req.body;
  const config = await badgeConfigService.toggleTierStatus(level, isActive, req.user._id);
  return ApiResponse.success(res, {
    message: `Tier ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: config,
  });
});

module.exports = {
  getConfig,
  updateConfig,
  addTier,
  updateTier,
  deleteTier,
  toggleTierStatus,
};