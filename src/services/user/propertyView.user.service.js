const PropertyView = require('../../models/propertyView.model');
const Property = require('../../models/Property.model');
const AppError = require('../../errors/AppError');

/**
 * Get view count for a property
 */
const getViewCount = async (propertyId, unique = false) => {
  // ✅ FIX: Allow all statuses except inactive, draft, pending, rejected
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    status: { $nin: ['inactive', 'draft', 'pending', 'rejected'] },
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  const count = await PropertyView.getViewCount(propertyId, unique);
  const totalViews = await PropertyView.countDocuments({
    propertyId,
    isDeleted: false,
  });

  return {
    propertyId,
    totalViews,
    uniqueViews: count,
  };
};

/**
 * Get active viewers count (last 30 minutes)
 */
const getActiveViewersCount = async (propertyId) => {
  // ✅ FIX: Allow all statuses except inactive, draft, pending, rejected
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    status: { $nin: ['inactive', 'draft', 'pending', 'rejected'] },
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const count = await PropertyView.countDocuments({
    propertyId,
    viewedAt: { $gte: thirtyMinutesAgo },
    isDeleted: false,
  });

  return count;
};

/**
 * Get view history for a property
 */
const getViewHistory = async (propertyId, { page = 1, limit = 20 }) => {
  // ✅ FIX: Allow all statuses except inactive, draft, pending, rejected
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    status: { $nin: ['inactive', 'draft', 'pending', 'rejected'] },
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  const result = await PropertyView.getPropertyViews(propertyId, { page, limit });
  return result;
};

/**
 * Track property view
 */
const trackView = async (propertyId, viewerInfo) => {
  // ✅ FIX: Allow all statuses except inactive, draft, pending, rejected
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    status: { $nin: ['inactive', 'draft', 'pending', 'rejected'] },
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  // Check for existing view in last 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const existingView = await PropertyView.findOne({
    propertyId,
    sessionId: viewerInfo.sessionId,
    viewedAt: { $gte: thirtyMinutesAgo },
    isDeleted: false,
  });

  const isUnique = !existingView;

  const view = await PropertyView.create({
    propertyId,
    viewerId: viewerInfo.viewerId || null,
    viewerType: viewerInfo.viewerType || 'guest',
    viewerName: viewerInfo.viewerName || null,
    viewerMobile: viewerInfo.viewerMobile || null,
    viewerEmail: viewerInfo.viewerEmail || null,
    sessionId: viewerInfo.sessionId,
    ipAddress: viewerInfo.ipAddress,
    userAgent: viewerInfo.userAgent,
    referrer: viewerInfo.referrer,
    source: viewerInfo.source || 'direct',
    isUnique,
    viewedAt: new Date(),
  });

  return view;
};

module.exports = {
  getViewCount,
  getActiveViewersCount,
  getViewHistory,
  trackView,
};