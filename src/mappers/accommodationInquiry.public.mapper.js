const toPublicSubmissionResponse = (inquiry) => ({
  _id: inquiry._id,
  inquiryRef: inquiry.inquiryRef,
  status: inquiry.status,
  fullName: inquiry.fullName,
  requirementType: inquiry.requirementType,
  submittedAt: inquiry.submittedAt ?? null,
  createdAt: inquiry.createdAt,
});

module.exports = {
  toPublicSubmissionResponse,
};
