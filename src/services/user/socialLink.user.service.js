const SocialLink = require('../../models/SocialLink.model');
const Property = require('../../models/Property.model');
const AppError = require('../../errors/AppError');
const { PLATFORM_LABELS, PLATFORM_ICONS } = require('../../constants/socialEnums');

/**
 * Get active social links for public display
 */
const getActiveSocialLinks = async () => {
  const links = await SocialLink.getActiveLinks();

  return links.map((link) => ({
    platform: link.platform,
    label: link.label || PLATFORM_LABELS[link.platform] || link.platform,
    url: link.url,
    icon: link.icon || PLATFORM_ICONS[link.platform] || '🔗',
    displayOrder: link.displayOrder,
  }));
};

/**
 * Get share URLs for a property
 */
const getPropertyShareUrls = async (propertyId) => {
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    status: { $nin: ['inactive', 'draft', 'pending', 'rejected'] },
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  // Build property URL
  const baseUrl = process.env.PUBLIC_API_BASE_URL || 'http://localhost:5173';
  const propertyUrl = `${baseUrl}/property/${property.listingId}`;
  const propertyTitle = property.title;

  const shareUrls = await SocialLink.getShareUrls(propertyUrl, propertyTitle);

  return {
    propertyId: property._id,
    propertyTitle,
    propertyUrl,
    shareLinks: shareUrls,
  };
};

/**
 * Get Linktree-style page for agent/owner
 */
const getAgentLinktree = async (agentId) => {
  // This will be implemented when agent profile is ready
  // For now, return social links
  const socialLinks = await getActiveSocialLinks();

  return {
    agentId,
    socialLinks,
    // Additional agent info will be added later
  };
};

module.exports = {
  getActiveSocialLinks,
  getPropertyShareUrls,
  getAgentLinktree,
};