const Inquiry = require('../../models/Inquiry.model');
const AppError = require('../../errors/AppError');
const { canSubmitFormType } = require('../../constants/customerAccountTypes');
const attachmentService = require('../inquiryAttachment.service');

const buildInquiryDocument = (formType, data, customer) => {
  const isDraft = Boolean(data.saveAsDraft);
  const now = new Date();

  return {
    formType,
    submittedBy: customer._id,
    submitterAccountType: customer.accountType,
    contact: {
      fullName: data.contact.fullName.trim(),
      mobile: data.contact.mobile,
      email: data.contact.email || null,
      alternativeMobile: data.contact.alternativeMobile || null,
    },
    location: data.location || null,
    payload: data.payload || {},
    remarks: data.remarks || null,
    message: data.message || null,
    status: isDraft ? 'draft' : 'new',
    submittedAt: isDraft ? null : now,
    inquirySource: 'website',
  };
};

const submitInquiry = async (formType, data, customer, files = {}) => {
  if (!canSubmitFormType(customer.accountType, formType)) {
    throw AppError.forbidden(`Your account type cannot submit ${formType.replace(/_/g, ' ')} inquiries`);
  }

  let inquiry = await Inquiry.create(buildInquiryDocument(formType, data, customer));

  try {
    const attachments = await attachmentService.uploadInquiryAttachments(inquiry._id, files);

    if (attachments.length) {
      inquiry.attachments = attachments;
      await inquiry.save();
    }
  } catch (error) {
    await attachmentService.deleteInquiryAttachments(inquiry.attachments);
    await Inquiry.deleteOne({ _id: inquiry._id });
    throw error;
  }

  return {
    inquiryRef: inquiry.inquiryRef,
    formType: inquiry.formType,
    status: inquiry.status,
    submittedAt: inquiry.submittedAt,
    createdAt: inquiry.createdAt,
  };
};

const listMyInquiries = async (customerId, { page = 1, limit = 10, formType } = {}) => {
  const filter = { submittedBy: customerId, isDeleted: false, status: { $ne: 'draft' } };
  if (formType) filter.formType = formType;

  const skip = (page - 1) * limit;
  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Inquiry.countDocuments(filter),
  ]);

  return {
    inquiries,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

module.exports = { submitInquiry, listMyInquiries };
