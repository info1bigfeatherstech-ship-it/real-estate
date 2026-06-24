const PropertyView = require('../../models/PropertyView.model');
const Property = require('../../models/Property.model');
const Inquiry = require('../../models/Inquiry.model');
const AppError = require('../../errors/AppError');

/**
 * Get FOMO data for a property
 * - Active viewers (last 30 minutes)
 * - Today's views
 * - Total views
 */
const getPropertyFOMO = async (propertyId) => {
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    status: 'active',
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const todayStart = new Date(now.setHours(0, 0, 0, 0));

  const [activeViewers, todayViews, totalViews, uniqueViews] = await Promise.all([
    // Active viewers (last 30 minutes)
    PropertyView.countDocuments({
      propertyId,
      viewedAt: { $gte: thirtyMinutesAgo },
      isDeleted: false,
    }),
    // Today's views
    PropertyView.countDocuments({
      propertyId,
      viewedAt: { $gte: todayStart },
      isDeleted: false,
    }),
    // Total views
    PropertyView.countDocuments({
      propertyId,
      isDeleted: false,
    }),
    // Unique viewers (by session)
    PropertyView.distinct('sessionId', {
      propertyId,
      isDeleted: false,
    }).then((sessions) => sessions.length),
  ]);

  // Format message
  let activeViewersMessage = null;
  if (activeViewers > 0) {
    if (activeViewers === 1) {
      activeViewersMessage = '1 person is viewing this property right now';
    } else {
      activeViewersMessage = `${activeViewers} people are viewing this property right now`;
    }
  }

  let todayViewsMessage = null;
  if (todayViews > 0) {
    if (todayViews === 1) {
      todayViewsMessage = '1 person viewed this property today';
    } else {
      todayViewsMessage = `${todayViews} people viewed this property today`;
    }
  }

  return {
    propertyId,
    propertyTitle: property.title,
    activeViewers,
    activeViewersMessage,
    todayViews,
    todayViewsMessage,
    totalViews,
    uniqueViews,
  };
};

/**
 * Get area-wise demand
 * Example: "X seekers want PG in Patel Nagar"
 */
const getAreaDemand = async ({ city, area, requirementType = null, limit = 10 } = {}) => {
  if (!city && !area) {
    throw AppError.badRequest('City or area is required');
  }

  // Build filter for inquiries
  const filter = {
    isDeleted: false,
    status: { $ne: 'draft' },
    'location.city': { $regex: new RegExp(city || '', 'i') },
  };

  if (area) {
    filter['location.area'] = { $regex: new RegExp(area, 'i') };
  }

  if (requirementType) {
    filter['payload.requirementType'] = requirementType;
  }

  // Get total seekers count
  const totalSeekers = await Inquiry.countDocuments(filter);

  // Get breakdown by requirement type
  const breakdown = await Inquiry.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$payload.requirementType',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Get recent inquiries
  const recentInquiries = await Inquiry.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('contact.fullName contact.mobile payload.requirementType createdAt')
    .lean();

  // Format area name for display
  const areaDisplay = area ? `${area}, ${city}` : city;

  return {
    city,
    area,
    areaDisplay,
    totalSeekers,
    requirementBreakdown: breakdown.map((item) => ({
      requirementType: item._id || 'Not specified',
      count: item.count,
    })),
    recentInquiries,
  };
};

/**
 * Get trending properties
 * - Most viewed properties in last 24 hours
 */
const getTrendingProperties = async ({ limit = 10, listingType = null } = {}) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get view counts per property in last 24 hours
  const trending = await PropertyView.aggregate([
    {
      $match: {
        viewedAt: { $gte: twentyFourHoursAgo },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$propertyId',
        viewCount: { $sum: 1 },
        uniqueViewers: { $addToSet: '$sessionId' },
      },
    },
    {
      $project: {
        propertyId: '$_id',
        viewCount: 1,
        uniqueViews: { $size: '$uniqueViewers' },
      },
    },
    { $sort: { viewCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'properties',
        localField: 'propertyId',
        foreignField: '_id',
        as: 'property',
      },
    },
    { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        'property.isDeleted': false,
        'property.status': 'active',
        ...(listingType ? { 'property.listingType': listingType } : {}),
      },
    },
  ]);

  return trending;
};

/**
 * Get demand for specific area with FOMO message
 */
const getAreaDemandFOMO = async ({ city, area = null } = {}) => {
  if (!city) {
    throw AppError.badRequest('City is required');
  }

  const areaFilter = { city, ...(area && { area }) };
  const areaDisplay = area ? `${area}, ${city}` : city;

  // Total seekers in area
  const totalSeekers = await Inquiry.countDocuments({
    isDeleted: false,
    status: { $ne: 'draft' },
    'location.city': { $regex: new RegExp(city, 'i') },
    ...(area && { 'location.area': { $regex: new RegExp(area, 'i') } }),
  });

  // Breakdown by requirement type
  const breakdown = await Inquiry.aggregate([
    {
      $match: {
        isDeleted: false,
        status: { $ne: 'draft' },
        'location.city': { $regex: new RegExp(city, 'i') },
        ...(area && { 'location.area': { $regex: new RegExp(area, 'i') } }),
      },
    },
    {
      $group: {
        _id: '$payload.requirementType',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // FOMO message
  let fomoMessage = null;
  if (totalSeekers > 0) {
    const topRequirement = breakdown.length > 0 ? breakdown[0]._id : 'property';
    if (totalSeekers === 1) {
      fomoMessage = `1 seeker is looking for ${topRequirement} in ${areaDisplay}`;
    } else {
      fomoMessage = `${totalSeekers} seekers are looking for ${topRequirement} in ${areaDisplay}`;
    }
  }

  return {
    city,
    area,
    areaDisplay,
    totalSeekers,
    fomoMessage,
    requirementBreakdown: breakdown,
  };
};

/**
 * Get property with FOMO data
 * Combines property details with FOMO data
 */
const getPropertyWithFOMO = async (propertyId) => {
  const [property, fomo] = await Promise.all([
    Property.findOne({
      _id: propertyId,
      isDeleted: false,
      status: 'active',
    }).select('title listingType price location.city'),
    getPropertyFOMO(propertyId),
  ]);

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  return {
    property,
    fomo,
  };
};

module.exports = {
  getPropertyFOMO,
  getAreaDemand,
  getAreaDemandFOMO,
  getTrendingProperties,
  getPropertyWithFOMO,
};