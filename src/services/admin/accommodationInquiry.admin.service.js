const Inquiry = require('../../models/Inquiry.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const attachmentService = require('../inquiryAttachment.service');
const { toLegacyAccommodationInquiry, mapLegacyList } = require('../../mappers/inquiryLegacy.mapper');

const FORM_TYPE = 'accommodation_requirement';

const populateFields = [
  { path: 'lastStatusUpdatedBy', select: 'name email role' },
  { path: 'submittedBy', select: 'fullName email mobile accountType' },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_FIELD_MAP = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  submittedAt: 'submittedAt',
  fullName: 'contact.fullName',
  status: 'status',
  monthlyBudget: 'payload.monthlyBudget',
};

const buildListFilter = ({
  search,
  status,
  requirementType,
  occupantType,
  city,
  monthlyBudget,
  moveInPriority,
}) => {
  const filter = {
    isDeleted: false,
    status: { $ne: 'draft' },
    formType: FORM_TYPE,
  };

  if (status) filter.status = status;
  if (requirementType) filter['payload.requirementType'] = requirementType;
  if (occupantType) filter['payload.occupantType'] = occupantType;
  if (monthlyBudget) filter['payload.monthlyBudget'] = monthlyBudget;
  if (moveInPriority) filter['payload.moveInPriority'] = moveInPriority;
  if (city) filter['location.city'] = new RegExp(escapeRegex(city), 'i');

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { inquiryRef: pattern },
      { 'contact.fullName': pattern },
      { 'contact.mobile': pattern },
      { 'contact.email': pattern },
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
  const sortField = SORT_FIELD_MAP[query.sortBy] || 'createdAt';
  const sort = { [sortField]: query.sortOrder === 'asc' ? 1 : -1 };

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter).sort(sort).skip(skip).limit(limit).populate(populateFields).lean(),
    Inquiry.countDocuments(filter),
  ]);

  return {
    inquiries: mapLegacyList(inquiries),
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getInquiryStats = async () => {
  const baseFilter = { isDeleted: false, status: { $ne: 'draft' }, formType: FORM_TYPE };

  const [total, statusGroups, requirementGroups] = await Promise.all([
    Inquiry.countDocuments(baseFilter),
    Inquiry.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Inquiry.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$payload.requirementType', count: { $sum: 1 } } },
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
  const inquiry = await Inquiry.findOne({
    _id: inquiryId,
    isDeleted: false,
    status: { $ne: 'draft' },
    formType: FORM_TYPE,
  }).populate(populateFields);

  if (!inquiry) throw AppError.notFound('Accommodation inquiry not found');
  return toLegacyAccommodationInquiry(inquiry);
};

const updateInquiryStatus = async (inquiryId, updates, userId) => {
  const allowed = [
    'status',
    'priority',
    'assignedTo',
    'adminNotes',
    'internalRemarks',
    'followUpNotes',
    'inquirySource',
  ];

  const update = {
    lastStatusUpdatedAt: new Date(),
    lastStatusUpdatedBy: userId,
  };

  allowed.forEach((key) => {
    if (updates[key] !== undefined) update[key] = updates[key] || null;
  });

  const inquiry = await Inquiry.findOneAndUpdate(
    { _id: inquiryId, isDeleted: false, status: { $ne: 'draft' }, formType: FORM_TYPE },
    update,
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!inquiry) throw AppError.notFound('Accommodation inquiry not found');
  return toLegacyAccommodationInquiry(inquiry);
};

const updateInquiryNotes = async (inquiryId, updates, userId) => {
  const allowed = [
    'priority',
    'assignedTo',
    'adminNotes',
    'internalRemarks',
    'followUpNotes',
    'inquirySource',
  ];

  const update = {
    lastStatusUpdatedBy: userId,
  };

  allowed.forEach((key) => {
    if (updates[key] !== undefined) update[key] = updates[key] || null;
  });

  const inquiry = await Inquiry.findOneAndUpdate(
    { _id: inquiryId, isDeleted: false, status: { $ne: 'draft' }, formType: FORM_TYPE },
    update,
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!inquiry) throw AppError.notFound('Accommodation inquiry not found');
  return toLegacyAccommodationInquiry(inquiry);
};

const deleteInquiry = async (inquiryId, userId) => {
  const inquiry = await Inquiry.findOne({
    _id: inquiryId,
    isDeleted: false,
    status: { $ne: 'draft' },
    formType: FORM_TYPE,
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
  return toLegacyAccommodationInquiry(inquiry);
};

module.exports = {
  listInquiries,
  getInquiryStats,
  getInquiryById,
  updateInquiryStatus,
  updateInquiryNotes,
  deleteInquiry,
};
