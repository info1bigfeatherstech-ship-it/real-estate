const AccommodationInquiry = require('../../models/AccommodationInquiry.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const attachmentService = require('../accommodationInquiryAttachment.service');

const populateFields = [{ path: 'lastStatusUpdatedBy', select: 'name email role' }];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildListFilter = ({ search, status, requirementType, occupantType, city, monthlyBudget, moveInPriority }) => {
  const filter = { isDeleted: false, status: { $ne: 'draft' } };

  if (status) filter.status = status;
  if (requirementType) filter.requirementType = requirementType;
  if (occupantType) filter.occupantType = occupantType;
  if (monthlyBudget) filter.monthlyBudget = monthlyBudget;
  if (moveInPriority) filter.moveInPriority = moveInPriority;
  if (city) filter['location.city'] = new RegExp(escapeRegex(city), 'i');

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { fullName: pattern },
      { mobile: pattern },
      { email: pattern },
      { inquiryRef: pattern },
      { 'location.city': pattern },
      { 'location.area': pattern },
      { remarks: pattern },
      { message: pattern },
    ];
  }

  return filter;
};

const listInquiries = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(query);
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [inquiries, total] = await Promise.all([
    AccommodationInquiry.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateFields)
      .lean(),
    AccommodationInquiry.countDocuments(filter),
  ]);

  return {
    inquiries,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getInquiryStats = async () => {
  const baseFilter = { isDeleted: false, status: { $ne: 'draft' } };

  const [total, statusGroups, requirementGroups] = await Promise.all([
    AccommodationInquiry.countDocuments(baseFilter),
    AccommodationInquiry.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    AccommodationInquiry.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$requirementType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const statusBreakdown = statusGroups.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    totalInquiries: total,
    statusBreakdown: {
      new: statusBreakdown.new || 0,
      contacted: statusBreakdown.contacted || 0,
      converted: statusBreakdown.converted || 0,
      lost: statusBreakdown.lost || 0,
      closed: statusBreakdown.closed || 0,
    },
    requirementTypeBreakdown: requirementGroups.map((item) => ({
      requirementType: item._id,
      count: item.count,
    })),
  };
};

const getInquiryById = async (inquiryId) => {
  const inquiry = await AccommodationInquiry.findOne({
    _id: inquiryId,
    isDeleted: false,
    status: { $ne: 'draft' },
  }).populate(populateFields);

  if (!inquiry) throw AppError.notFound('Accommodation inquiry not found');
  return inquiry;
};

const updateInquiryStatus = async (inquiryId, { status, adminNotes }, userId) => {
  const update = {
    status,
    lastStatusUpdatedAt: new Date(),
    lastStatusUpdatedBy: userId,
  };

  if (adminNotes !== undefined) {
    update.adminNotes = adminNotes || null;
  }

  const inquiry = await AccommodationInquiry.findOneAndUpdate(
    { _id: inquiryId, isDeleted: false, status: { $ne: 'draft' } },
    update,
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!inquiry) throw AppError.notFound('Accommodation inquiry not found');
  return inquiry;
};

const updateInquiryNotes = async (inquiryId, { adminNotes }, userId) => {
  const inquiry = await AccommodationInquiry.findOneAndUpdate(
    { _id: inquiryId, isDeleted: false, status: { $ne: 'draft' } },
    { adminNotes: adminNotes || null, lastStatusUpdatedBy: userId },
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!inquiry) throw AppError.notFound('Accommodation inquiry not found');
  return inquiry;
};

const deleteInquiry = async (inquiryId, userId) => {
  const inquiry = await AccommodationInquiry.findOne({
    _id: inquiryId,
    isDeleted: false,
    status: { $ne: 'draft' },
  });

  if (!inquiry) throw AppError.notFound('Accommodation inquiry not found');

  await attachmentService.deleteInquiryAttachments(inquiry.attachments);

  inquiry.attachments = [];
  inquiry.isDeleted = true;
  inquiry.deletedAt = new Date();
  inquiry.status = 'closed';
  inquiry.lastStatusUpdatedBy = userId;
  inquiry.lastStatusUpdatedAt = new Date();

  await inquiry.save();
  return inquiry;
};

module.exports = {
  listInquiries,
  getInquiryStats,
  getInquiryById,
  updateInquiryStatus,
  updateInquiryNotes,
  deleteInquiry,
};
