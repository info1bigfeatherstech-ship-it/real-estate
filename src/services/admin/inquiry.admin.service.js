const Inquiry = require('../../models/Inquiry.model');
const Customer = require('../../models/Customer.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const attachmentService = require('../inquiryAttachment.service');
const { INQUIRY_FORM_TYPES } = require('../../constants/inquiryEnums');

const populateFields = [
  { path: 'lastStatusUpdatedBy', select: 'name email role' },
  { path: 'assignedTo', select: 'name email role' },
  { path: 'submittedBy', select: 'fullName email mobile accountType' },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildListFilter = (query) => {
  const filter = { isDeleted: false, status: { $ne: 'draft' } };

  if (query.status) filter.status = query.status;
  if (query.formType) filter.formType = query.formType;
  if (query.priority) filter.priority = query.priority;
  if (query.inquirySource) filter.inquirySource = query.inquirySource;
  if (query.submitterAccountType) filter.submitterAccountType = query.submitterAccountType;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.city) filter['location.city'] = new RegExp(escapeRegex(query.city), 'i');

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
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
  const sort = { [query.sortBy || 'createdAt']: query.sortOrder === 'asc' ? 1 : -1 };

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter).sort(sort).skip(skip).limit(limit).populate(populateFields).lean(),
    Inquiry.countDocuments(filter),
  ]);

  return {
    inquiries,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getInquiryStats = async (query = {}) => {
  const baseFilter = { isDeleted: false, status: { $ne: 'draft' } };
  if (query.formType) baseFilter.formType = query.formType;

  const [total, statusGroups, formTypeGroups, priorityGroups] = await Promise.all([
    Inquiry.countDocuments(baseFilter),
    Inquiry.aggregate([{ $match: baseFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    query.formType
      ? Promise.resolve([])
      : Inquiry.aggregate([
          { $match: baseFilter },
          { $group: { _id: '$formType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
    Inquiry.aggregate([{ $match: baseFilter }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
  ]);

  const statusBreakdown = statusGroups.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    totalInquiries: total,
    statusBreakdown,
    formTypeBreakdown: formTypeGroups.map((item) => ({
      formType: item._id,
      count: item.count,
    })),
    priorityBreakdown: priorityGroups.map((item) => ({
      priority: item._id,
      count: item.count,
    })),
  };
};

const getInquiryById = async (inquiryId) => {
  const inquiry = await Inquiry.findOne({
    _id: inquiryId,
    isDeleted: false,
    status: { $ne: 'draft' },
  }).populate(populateFields);

  if (!inquiry) throw AppError.notFound('Inquiry not found');
  return inquiry;
};

const updateInquiry = async (inquiryId, updates, userId) => {
  const allowed = [
    'status',
    'priority',
    'assignedTo',
    'adminNotes',
    'internalRemarks',
    'followUpNotes',
    'inquirySource',
  ];

  const update = {};
  allowed.forEach((key) => {
    if (updates[key] !== undefined) update[key] = updates[key] || null;
  });

  if (updates.status) {
    update.lastStatusUpdatedAt = new Date();
    update.lastStatusUpdatedBy = userId;
  }

  const inquiry = await Inquiry.findOneAndUpdate(
    { _id: inquiryId, isDeleted: false, status: { $ne: 'draft' } },
    update,
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!inquiry) throw AppError.notFound('Inquiry not found');
  return inquiry;
};

const deleteInquiry = async (inquiryId) => {
  const inquiry = await Inquiry.findOne({ _id: inquiryId, isDeleted: false });
  if (!inquiry) throw AppError.notFound('Inquiry not found');

  await attachmentService.deleteInquiryAttachments(inquiry.attachments);

  inquiry.isDeleted = true;
  inquiry.deletedAt = new Date();
  inquiry.status = 'closed';
  await inquiry.save();

  return { id: inquiryId };
};

module.exports = {
  listInquiries,
  getInquiryStats,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
  INQUIRY_FORM_TYPES,
};
