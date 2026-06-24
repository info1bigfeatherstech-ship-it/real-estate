const GeneralInquiry = require('../../models/GeneralInquiry.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { escapeRegex } = require('../../utils/regex');

const populateFields = [];

// ─── Build List Filter ────────────────────────────────────────────────────
const buildListFilter = ({ search, status, fromDate, toDate }) => {
  const filter = { isDeleted: false };

  if (status) filter.status = status;
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { fullName: pattern },
      { city: pattern },
      { contactNumber: pattern },
      { email: pattern },
      { message: pattern },
    ];
  }

  return filter;
};

// ─── List Inquiries ──────────────────────────────────────────────────────
const listInquiries = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(query);
  const sort = { [query.sortBy || 'createdAt']: query.sortOrder === 'asc' ? 1 : -1 };

  const [inquiries, total] = await Promise.all([
    GeneralInquiry.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    GeneralInquiry.countDocuments(filter),
  ]);

  return {
    inquiries,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

// ─── Get Inquiry by ID ──────────────────────────────────────────────────
const getInquiryById = async (inquiryId) => {
  const inquiry = await GeneralInquiry.findOne({
    _id: inquiryId,
    isDeleted: false,
  }).lean();

  if (!inquiry) {
    throw AppError.notFound('Inquiry not found');
  }

  return inquiry;
};

// ─── Update Inquiry Status ──────────────────────────────────────────────
const updateInquiryStatus = async (inquiryId, status, adminNotes) => {
  const inquiry = await GeneralInquiry.findOne({
    _id: inquiryId,
    isDeleted: false,
  });

  if (!inquiry) {
    throw AppError.notFound('Inquiry not found');
  }

  inquiry.status = status;
  if (adminNotes !== undefined) {
    inquiry.adminNotes = adminNotes || null;
  }

  await inquiry.save();

  return inquiry;
};

// ─── Delete Inquiry ──────────────────────────────────────────────────────
const deleteInquiry = async (inquiryId) => {
  const inquiry = await GeneralInquiry.findOne({
    _id: inquiryId,
    isDeleted: false,
  });

  if (!inquiry) {
    throw AppError.notFound('Inquiry not found');
  }

  inquiry.isDeleted = true;
  inquiry.deletedAt = new Date();
  await inquiry.save();

  return inquiry;
};

// ─── Get Stats ──────────────────────────────────────────────────────────
const getInquiryStats = async () => {
  const [total, newCount, readCount, contactedCount, archivedCount] = await Promise.all([
    GeneralInquiry.countDocuments({ isDeleted: false }),
    GeneralInquiry.countDocuments({ isDeleted: false, status: 'new' }),
    GeneralInquiry.countDocuments({ isDeleted: false, status: 'read' }),
    GeneralInquiry.countDocuments({ isDeleted: false, status: 'contacted' }),
    GeneralInquiry.countDocuments({ isDeleted: false, status: 'archived' }),
  ]);

  return {
    total,
    new: newCount,
    read: readCount,
    contacted: contactedCount,
    archived: archivedCount,
  };
};

module.exports = {
  listInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  getInquiryStats,
};