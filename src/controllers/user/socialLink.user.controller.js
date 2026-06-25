const socialLinkService = require('../../services/user/socialLink.user.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get active social links
 * GET /api/v1/user/social-links
 */
const getSocialLinks = asyncHandler(async (req, res) => {
  const links = await socialLinkService.getActiveSocialLinks();
  return ApiResponse.success(res, {
    message: 'Social links fetched successfully',
    data: links,
  });
});

/**
 * Get share URLs for a property
 * GET /api/v1/user/properties/:id/share
 */
const getPropertyShareUrls = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await socialLinkService.getPropertyShareUrls(id);
  return ApiResponse.success(res, {
    message: 'Property share URLs fetched successfully',
    data: result,
  });
});

/**
 * Get Linktree-style page for agent
 * GET /api/v1/user/agent/:id/linktree
 */
const getAgentLinktree = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await socialLinkService.getAgentLinktree(id);
  return ApiResponse.success(res, {
    message: 'Agent linktree fetched successfully',
    data: result,
  });
});

module.exports = {
  getSocialLinks,
  getPropertyShareUrls,
  getAgentLinktree,
};