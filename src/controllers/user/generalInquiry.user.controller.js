const generalInquiryService = require('../../services/user/generalInquiry.user.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Submit a general inquiry
 * POST /api/v1/user/general-inquiries
 */
const createInquiry = asyncHandler(async (req, res) => {
  const ipInfo = {
    ipAddress: req.ip || req.headers['x-forwarded-for']?.split(',')[0] || null,
    userAgent: req.headers['user-agent'] || null,
    referrer: req.headers['referer'] || req.headers['referrer'] || null,
  };

  const inquiry = await generalInquiryService.createInquiry(req.body, ipInfo);

  return ApiResponse.created(res, {
    message: 'Inquiry submitted successfully. We will get back to you soon.',
    data: {
      id: inquiry._id,
      fullName: inquiry.fullName,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    },
  });
});

/**
 * Get inquiry status (optional)
 * GET /api/v1/user/general-inquiries/:id
 */
const getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await generalInquiryService.getInquiryById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Inquiry fetched successfully',
    data: {
      id: inquiry._id,
      fullName: inquiry.fullName,
      city: inquiry.city,
      contactNumber: inquiry.contactNumber,
      email: inquiry.email,
      subject: inquiry.subject,
      message: inquiry.message,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    },
  });
});

module.exports = {
  createInquiry,
  getInquiry,
};