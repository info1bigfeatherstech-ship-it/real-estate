const Property = require('../../models/Property.model');
const PropertyView = require('../../models/PropertyView.model');
const Inquiry = require('../../models/Inquiry.model');
const Customer = require('../../models/Customer.model');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { escapeRegex } = require('../../utils/regex');

// ─── 1. PROPERTY VIEWS REPORT ─────────────────────────────────────────────

/**
 * Get property views report with filters
 */
const getPropertyViewsReport = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildDateFilter(query);
  const match = { isDeleted: false, ...filter };

  // Get aggregated views per property
  const viewsData = await PropertyView.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$propertyId',
        totalViews: { $sum: 1 },
        uniqueViewers: { $addToSet: '$sessionId' },
        todayViews: {
          $sum: {
            $cond: [
              { $gte: ['$viewedAt', new Date(new Date().setHours(0, 0, 0, 0))] },
              1,
              0,
            ],
          },
        },
        lastViewed: { $max: '$viewedAt' },
        viewers: {
          $push: {
            name: '$viewerName',
            mobile: '$viewerMobile',
            email: '$viewerEmail',
            viewedAt: '$viewedAt',
          },
        },
      },
    },
    {
      $project: {
        propertyId: '$_id',
        totalViews: 1,
        uniqueViews: { $size: '$uniqueViewers' },
        todayViews: 1,
        lastViewed: 1,
        viewers: { $slice: ['$viewers', 10] }, // Only top 10 viewers
      },
    },
    { $sort: { totalViews: -1 } },
    { $skip: skip },
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
      $project: {
        propertyId: '$property.listingId',
        title: '$property.title',
        listingType: '$property.listingType',
        price: '$property.price',
        location: '$property.location',
        totalViews: 1,
        uniqueViews: 1,
        todayViews: 1,
        lastViewed: 1,
        viewers: 1,
      },
    },
  ]);

  const total = await PropertyView.distinct('propertyId', match).then((ids) => ids.length);

  return {
    data: viewsData,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

// ─── 2. LEAD CONVERSION REPORT ────────────────────────────────────────────

/**
 * Get lead conversion report
 */
const getLeadConversionReport = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildInquiryFilter(query);

  const [leads, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('submittedBy', 'fullName email mobile')
      .lean(),
    Inquiry.countDocuments(filter),
  ]);

  // Process leads with conversion metrics
  const processedLeads = leads.map((lead) => {
    const daysToConvert = lead.status === 'converted' && lead.updatedAt
      ? Math.floor(
          (new Date(lead.updatedAt) - new Date(lead.createdAt)) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    return {
      inquiryRef: lead.inquiryRef,
      formType: lead.formType,
      fullName: lead.contact?.fullName || 'N/A',
      mobile: lead.contact?.mobile || 'N/A',
      email: lead.contact?.email || 'N/A',
      requirement: lead.payload?.requirementType || lead.formType,
      status: lead.status,
      createdAt: lead.createdAt,
      convertedAt: lead.status === 'converted' ? lead.updatedAt : null,
      daysToConvert,
      source: lead.inquirySource || 'website',
      submittedBy: lead.submittedBy,
    };
  });

  // Summary stats
  const summary = await getLeadSummary(filter);

  return {
    data: processedLeads,
    meta: {
      ...buildPaginationMeta({ page, limit, total }),
      summary,
    },
  };
};

/**
 * Get lead summary stats
 */
const getLeadSummary = async (baseFilter) => {
  const filter = { ...baseFilter };

  const [total, newLeads, contacted, converted, lost, closed] = await Promise.all([
    Inquiry.countDocuments(filter),
    Inquiry.countDocuments({ ...filter, status: 'new' }),
    Inquiry.countDocuments({ ...filter, status: 'contacted' }),
    Inquiry.countDocuments({ ...filter, status: 'converted' }),
    Inquiry.countDocuments({ ...filter, status: 'lost' }),
    Inquiry.countDocuments({ ...filter, status: 'closed' }),
  ]);

  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';

  return {
    totalLeads: total,
    new: newLeads,
    contacted,
    converted,
    lost,
    closed,
    conversionRate: `${conversionRate}%`,
  };
};

// ─── 3. REVENUE REPORT ────────────────────────────────────────────────────

/**
 * Get revenue report
 */
const getRevenueReport = async (query = {}) => {
  const { period = 'monthly' } = query;
  const dateFilter = buildDateFilter(query);

  // This will be enhanced with actual subscription/commission data
  // For now, return placeholder structure
  const revenueData = await generateRevenueData(period, dateFilter);

  return {
    data: revenueData,
    meta: {
      period,
      currency: 'INR',
    },
  };
};

/**
 * Generate revenue data (placeholder - will integrate with subscriptions/commissions)
 */
const generateRevenueData = async (period, dateFilter) => {
  // Placeholder - will be replaced with actual subscription and commission data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const trend = months.map((month, index) => ({
    month,
    revenue: 100000 + index * 15000 + Math.floor(Math.random() * 20000),
  }));

  return {
    period,
    totalRevenue: 1250000,
    breakdown: {
      subscriptions: 750000,
      commissions: 350000,
      leads: 150000,
    },
    growth: {
      vsPreviousMonth: '+15.2%',
      vsLastYear: '+28.5%',
    },
    monthlyTrend: trend,
  };
};

// ─── 4. PROPERTY ANALYSIS REPORT ──────────────────────────────────────────

/**
 * Get property analysis report
 */
const getPropertyAnalysisReport = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildPropertyFilter(query);

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Property.countDocuments(filter),
  ]);

  // Get view counts and inquiry counts for each property
  const propertyIds = properties.map((p) => p._id);

  const [viewCounts, inquiryCounts] = await Promise.all([
    PropertyView.aggregate([
      { $match: { propertyId: { $in: propertyIds }, isDeleted: false } },
      {
        $group: {
          _id: '$propertyId',
          views: { $sum: 1 },
          uniqueViewers: { $addToSet: '$sessionId' },
        },
      },
    ]),
    Inquiry.aggregate([
      {
        $match: {
          'payload.propertyId': { $in: propertyIds },
          isDeleted: false,
        },
      },
      { $group: { _id: '$payload.propertyId', inquiries: { $sum: 1 } } },
    ]),
  ]);

  const viewsMap = Object.fromEntries(
    viewCounts.map((v) => [v._id.toString(), { views: v.views, uniqueViews: v.uniqueViewers.length }])
  );
  const inquiriesMap = Object.fromEntries(
    inquiryCounts.map((i) => [i._id.toString(), { inquiries: i.inquiries }])
  );

  const processedData = properties.map((property) => {
    const views = viewsMap[property._id.toString()] || { views: 0, uniqueViews: 0 };
    const inquiries = inquiriesMap[property._id.toString()] || { inquiries: 0 };

    return {
      propertyId: property.listingId,
      title: property.title,
      listingType: property.listingType,
      price: property.price,
      roi: property.roi || null,
      status: property.status,
      location: property.location,
      views: views.views,
      uniqueViews: views.uniqueViews,
      inquiries: inquiries.inquiries,
      daysOnMarket: property.publishedAt
        ? Math.floor((Date.now() - new Date(property.publishedAt)) / (1000 * 60 * 60 * 24))
        : 0,
      createdAt: property.createdAt,
    };
  });

  // Summary
  const summary = {
    totalProperties: total,
    active: properties.filter((p) => p.status === 'active').length,
    sold: properties.filter((p) => p.status === 'sold').length,
    rented: properties.filter((p) => p.status === 'rented').length,
    avgViewsPerProperty: total > 0
      ? Math.round(processedData.reduce((acc, p) => acc + p.views, 0) / total)
      : 0,
    avgInquiriesPerProperty: total > 0
      ? Math.round(processedData.reduce((acc, p) => acc + p.inquiries, 0) / total)
      : 0,
  };

  return {
    data: processedData,
    meta: {
      ...buildPaginationMeta({ page, limit, total }),
      summary,
    },
  };
};

// ─── 5. CUSTOMER ACTIVITY REPORT ─────────────────────────────────────────

/**
 * Get customer activity report
 */
const getCustomerActivityReport = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildCustomerFilter(query);

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Customer.countDocuments(filter),
  ]);

  // Get activity data for each customer
  const customerIds = customers.map((c) => c._id);

  const [inquiryCounts, viewCounts] = await Promise.all([
    Inquiry.aggregate([
      { $match: { submittedBy: { $in: customerIds }, isDeleted: false } },
      { $group: { _id: '$submittedBy', inquiries: { $sum: 1 } } },
    ]),
    PropertyView.aggregate([
      { $match: { viewerId: { $in: customerIds }, isDeleted: false } },
      { $group: { _id: '$viewerId', views: { $sum: 1 } } },
    ]),
  ]);

  const inquiriesMap = Object.fromEntries(
    inquiryCounts.map((i) => [i._id.toString(), i.inquiries])
  );
  const viewsMap = Object.fromEntries(
    viewCounts.map((v) => [v._id.toString(), v.views])
  );

  const processedData = customers.map((customer) => ({
    customerId: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    mobile: customer.mobile,
    accountType: customer.accountType,
    emailVerified: customer.emailVerified,
    isActive: customer.isActive,
    inquiries: inquiriesMap[customer._id.toString()] || 0,
    views: viewsMap[customer._id.toString()] || 0,
    lastLoginAt: customer.lastLoginAt,
    createdAt: customer.createdAt,
  }));

  return {
    data: processedData,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

// ─── FILTER BUILDERS ──────────────────────────────────────────────────────

const buildDateFilter = (query) => {
  const filter = {};
  if (query.dateFrom || query.dateTo) {
    filter.viewedAt = {};
    if (query.dateFrom) filter.viewedAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.viewedAt.$lte = new Date(query.dateTo);
  }
  return filter;
};

const buildInquiryFilter = (query) => {
  const filter = { isDeleted: false, status: { $ne: 'draft' } };

  if (query.status) filter.status = query.status;
  if (query.formType) filter.formType = query.formType;
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { inquiryRef: pattern },
      { 'contact.fullName': pattern },
      { 'contact.mobile': pattern },
      { 'contact.email': pattern },
    ];
  }
  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.createdAt.$lte = new Date(query.dateTo);
  }

  return filter;
};

const buildPropertyFilter = (query) => {
  const filter = { isDeleted: false };

  if (query.listingType) filter.listingType = query.listingType;
  if (query.status) filter.status = query.status;
  if (query.city) filter['location.city'] = new RegExp(escapeRegex(query.city), 'i');
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { title: pattern },
      { listingId: pattern },
      { 'location.city': pattern },
    ];
  }

  return filter;
};

const buildCustomerFilter = (query) => {
  const filter = {};

  if (query.accountType) filter.accountType = query.accountType;
  if (query.isActive !== undefined && query.isActive !== '') {
    filter.isActive = query.isActive === 'true';
  }
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { fullName: pattern },
      { email: pattern },
      { mobile: pattern },
    ];
  }

  return filter;
};

// ─── EXPORT ALL ────────────────────────────────────────────────────────────

module.exports = {
  getPropertyViewsReport,
  getLeadConversionReport,
  getRevenueReport,
  getPropertyAnalysisReport,
  getCustomerActivityReport,
};