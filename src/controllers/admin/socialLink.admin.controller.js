const socialLinkService = require('../../services/admin/socialLink.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── List Social Links ────────────────────────────────────────────────────
const listSocialLinks = asyncHandler(async (req, res) => {
  const result = await socialLinkService.listSocialLinks(req.query);
  return ApiResponse.success(res, {
    message: 'Social links fetched successfully',
    data: result.links,
    meta: result.meta,
  });
});

// ─── Get Single Social Link ──────────────────────────────────────────────
const getSocialLink = asyncHandler(async (req, res) => {
  const link = await socialLinkService.getSocialLinkById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Social link fetched successfully',
    data: link,
  });
});

// ─── Create Social Link ──────────────────────────────────────────────────
const createSocialLink = asyncHandler(async (req, res) => {
  const link = await socialLinkService.createSocialLink(req.body, req.user._id);
  return ApiResponse.created(res, {
    message: `Social link for "${link.platform}" created successfully`,
    data: link,
  });
});

// ─── Update Social Link ──────────────────────────────────────────────────
const updateSocialLink = asyncHandler(async (req, res) => {
  const link = await socialLinkService.updateSocialLink(
    req.params.id,
    req.body,
    req.user._id
  );
  return ApiResponse.success(res, {
    message: `Social link updated successfully`,
    data: link,
  });
});

// ─── Toggle Social Link Status ──────────────────────────────────────────
const toggleSocialLinkStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const link = await socialLinkService.toggleSocialLinkStatus(
    req.params.id,
    isActive,
    req.user._id
  );
  return ApiResponse.success(res, {
    message: `Social link ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: link,
  });
});

// ─── Delete Social Link ──────────────────────────────────────────────────
const deleteSocialLink = asyncHandler(async (req, res) => {
  await socialLinkService.deleteSocialLink(req.params.id);
  return ApiResponse.success(res, {
    message: 'Social link deleted successfully',
  });
});

module.exports = {
  listSocialLinks,
  getSocialLink,
  createSocialLink,
  updateSocialLink,
  toggleSocialLinkStatus,
  deleteSocialLink,
};