const propertyService = require('../../services/user/property.user.service');
const propertyViewService = require('../../services/user/propertyView.user.service'); // ← ADD THIS
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// ─── List Properties ──────────────────────────────────────────────────────
const listProperties = asyncHandler(async (req, res) => {
  const result = await propertyService.listProperties(req.query);
  return ApiResponse.success(res, {
    message: 'Properties fetched successfully',
    data: result.properties,
    meta: result.meta,
  });
});

// ─── Get Property By ID ──────────────────────────────────────────────────
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id);
  
  // ✅ Track view automatically when property is viewed
  try {
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
    await propertyViewService.trackView(req.params.id, viewerInfo);
  } catch (error) {
    // Don't fail the request if tracking fails
    console.error('View tracking error:', error);
  }
  
  return ApiResponse.success(res, {
    message: 'Property fetched successfully',
    data: property,
  });
});

// ─── Get Property By Listing ID ──────────────────────────────────────────
const getPropertyByListingId = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyByListingId(req.params.listingId);
  
  // ✅ Track view automatically when property is viewed
  try {
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
    await propertyViewService.trackView(property._id, viewerInfo);
  } catch (error) {
    console.error('View tracking error:', error);
  }
  
  return ApiResponse.success(res, {
    message: 'Property fetched successfully',
    data: property,
  });
});

// ─── Get Related Properties ──────────────────────────────────────────────
const getRelatedProperties = asyncHandler(async (req, res) => {
  const properties = await propertyService.getRelatedProperties(req.params.id, req.query);
  return ApiResponse.success(res, {
    message: 'Related properties fetched successfully',
    data: properties,
  });
});

module.exports = {
  listProperties,
  getPropertyById,
  getPropertyByListingId,
  getRelatedProperties,
};