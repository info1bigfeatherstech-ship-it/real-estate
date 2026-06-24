const mongoose = require('mongoose'); // ← ADD THIS
const PropertyView = require('../../models/PropertyView.model');
const Property = require('../../models/Property.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { escapeRegex } = require('../../utils/regex');

/**
 * Get all views with filters
 */
const getAllViews = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildViewFilter(query);
  const sort = { [query.sortBy || 'viewedAt']: query.sortOrder === 'asc' ? 1 : -1 };

  const [views, total] = await Promise.all([
    PropertyView.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('propertyId', 'title listingId listingType')
      .populate('viewerId', 'fullName email mobile accountType')
      .lean(),
    PropertyView.countDocuments(filter),
  ]);

  return {
    views,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

/**
 * Build view filter for admin
 */
const buildViewFilter = ({ search, propertyId, viewerType, fromDate, toDate }) => {
  const filter = { isDeleted: false };

  if (propertyId) filter.propertyId = propertyId;
  if (viewerType) filter.viewerType = viewerType;

  if (fromDate || toDate) {
    filter.viewedAt = {};
    if (fromDate) filter.viewedAt.$gte = new Date(fromDate);
    if (toDate) filter.viewedAt.$lte = new Date(toDate);
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { viewerName: pattern },
      { viewerMobile: pattern },
      { viewerEmail: pattern },
    ];
  }

  return filter;
};

/**
 * Get property view stats — ✅ FIXED
 */
const getPropertyViewStats = async (propertyId) => {
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  // ✅ FIX 1: Convert string ID to ObjectId for aggregation
  const objectId = new mongoose.Types.ObjectId(propertyId);

  const [totalViews, uniqueViews, viewsLast7Days, viewsLast30Days, viewerBreakdown] =
    await Promise.all([
      PropertyView.countDocuments({ propertyId, isDeleted: false }),
      PropertyView.distinct('sessionId', { propertyId, isDeleted: false }).then(
        (sessions) => sessions.length
      ),
      PropertyView.countDocuments({
        propertyId,
        viewedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        isDeleted: false,
      }),
      PropertyView.countDocuments({
        propertyId,
        viewedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        isDeleted: false,
      }),
      // ✅ FIX: Use ObjectId in aggregation pipeline
      PropertyView.aggregate([
        { $match: { propertyId: objectId, isDeleted: false } },
        { $group: { _id: '$viewerType', count: { $sum: 1 } } },
      ]),
    ]);

  return {
    propertyId,
    totalViews,
    uniqueViews,
    viewsLast7Days,
    viewsLast30Days,
    viewerBreakdown: viewerBreakdown.map((item) => ({
      viewerType: item._id || 'guest',
      count: item.count,
    })),
  };
};

/**
 * Get all properties view stats (for dashboard)
 */
const getAllPropertiesViewStats = async () => {
  const stats = await PropertyView.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$propertyId',
        totalViews: { $sum: 1 },
        uniqueViews: { $addToSet: '$sessionId' },
        lastViewed: { $max: '$viewedAt' },
      },
    },
    {
      $project: {
        propertyId: '$_id',
        totalViews: 1,
        uniqueViews: { $size: '$uniqueViews' },
        lastViewed: 1,
      },
    },
    { $sort: { totalViews: -1 } },
    { $limit: 50 },
    {
      $lookup: {
        from: 'properties',
        localField: 'propertyId',
        foreignField: '_id',
        as: 'property',
      },
    },
    { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
  ]);

  return stats;
};

/**
 * Get viewers list for a property — ✅ FIXED
 */
const getPropertyViewers = async (propertyId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  // ✅ FIX 2: Remove viewerName: { $ne: null } filter
  // Show ALL viewers including guests (without name)
  const viewers = await PropertyView.find({
    propertyId,
    isDeleted: false,
    // viewerName: { $ne: null }, // ← REMOVED
  })
    .sort({ viewedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('viewerId', 'fullName email mobile accountType')
    .lean();

  // Count total viewers (excluding the name filter)
  const total = await PropertyView.countDocuments({
    propertyId,
    isDeleted: false,
  });

  return {
    viewers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  getAllViews,
  getPropertyViewStats,
  getAllPropertiesViewStats,
  getPropertyViewers,
};