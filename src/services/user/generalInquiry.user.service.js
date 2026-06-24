const GeneralInquiry = require('../../models/GeneralInquiry.model');
const AppError = require('../../errors/AppError');

/**
 * Create a new general inquiry
 */
const createInquiry = async (data, ipInfo = {}) => {
  const inquiry = await GeneralInquiry.create({
    fullName: data.fullName.trim(),
    city: data.city.trim(),
    contactNumber: data.contactNumber.trim(),
    email: data.email || null,
    subject: data.subject || null,
    message: data.message.trim(),
    source: data.source || 'website',
    ipAddress: ipInfo.ipAddress || null,
    userAgent: ipInfo.userAgent || null,
    referrer: ipInfo.referrer || null,
    status: 'new',
  });

  return inquiry;
};

/**
 * Get inquiry by ID (for user view)
 */
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

module.exports = {
  createInquiry,
  getInquiryById,
};