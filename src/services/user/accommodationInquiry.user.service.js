const AccommodationInquiry = require('../../models/AccommodationInquiry.model');
const attachmentService = require('../accommodationInquiryAttachment.service');
const { toPublicSubmissionResponse } = require('../../mappers/accommodationInquiry.public.mapper');

const buildInquiryPayload = (data) => {
  const {
    saveAsDraft,
    fullName,
    mobile,
    email,
    alternativeMobile,
    requirementType,
    occupantType,
    genderPreference,
    location,
    monthlyBudget,
    propertyType,
    bhkRequirement,
    tenantTypePreference,
    foodPreference,
    petPreference,
    smokingPreference,
    alcoholPreference,
    sharingPreference,
    furnishingPreference,
    amenitiesRequired,
    moveInPriority,
    remarks,
    message,
  } = data;

  const isDraft = Boolean(saveAsDraft);
  const now = new Date();

  return {
    fullName,
    mobile,
    email: email || null,
    alternativeMobile: alternativeMobile || null,
    requirementType: requirementType || null,
    occupantType: occupantType || null,
    genderPreference: genderPreference || null,
    location: location || null,
    monthlyBudget: monthlyBudget || null,
    propertyType: propertyType || null,
    bhkRequirement: bhkRequirement || null,
    tenantTypePreference: tenantTypePreference || null,
    foodPreference: foodPreference || null,
    petPreference: petPreference || null,
    smokingPreference: smokingPreference || null,
    alcoholPreference: alcoholPreference || null,
    sharingPreference: sharingPreference || null,
    furnishingPreference: furnishingPreference || null,
    amenitiesRequired: amenitiesRequired || [],
    moveInPriority: moveInPriority || null,
    remarks: remarks || null,
    message: message || null,
    status: isDraft ? 'draft' : 'new',
    submittedAt: isDraft ? null : now,
  };
};

const submitInquiry = async (data, files = {}) => {
  let inquiry = await AccommodationInquiry.create(buildInquiryPayload(data));

  try {
    const attachments = await attachmentService.uploadInquiryAttachments(inquiry._id, files);

    if (attachments.length) {
      inquiry.attachments = attachments;
      await inquiry.save();
    }
  } catch (error) {
    await attachmentService.deleteInquiryAttachments(inquiry.attachments);
    await AccommodationInquiry.deleteOne({ _id: inquiry._id });
    throw error;
  }

  return toPublicSubmissionResponse(inquiry);
};

module.exports = {
  submitInquiry,
};
