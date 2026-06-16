const Joi = require('joi');
const {
  REQUIREMENT_TYPES,
  OCCUPANT_TYPES,
  MONTHLY_BUDGETS,
  MOVE_IN_PRIORITIES,
  ADMIN_INQUIRY_STATUSES,
} = require('../../constants/accommodationInquiryEnums');

const listAccommodationInquiriesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).allow(''),
  status: Joi.string().valid(...ADMIN_INQUIRY_STATUSES),
  requirementType: Joi.string().valid(...REQUIREMENT_TYPES),
  occupantType: Joi.string().valid(...OCCUPANT_TYPES),
  city: Joi.string().trim().max(100),
  monthlyBudget: Joi.string().valid(...MONTHLY_BUDGETS),
  moveInPriority: Joi.string().valid(...MOVE_IN_PRIORITIES),
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'submittedAt', 'fullName', 'status', 'monthlyBudget')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const updateAccommodationInquiryStatusSchema = Joi.object({
  status: Joi.string().valid(...ADMIN_INQUIRY_STATUSES).required(),
  adminNotes: Joi.string().trim().max(2000).allow('', null),
});

const updateAccommodationInquirySchema = Joi.object({
  adminNotes: Joi.string().trim().max(2000).allow('', null),
}).min(1);

const accommodationInquiryIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({ 'string.hex': 'Invalid inquiry ID', 'string.length': 'Invalid inquiry ID' }),
});

module.exports = {
  listAccommodationInquiriesQuerySchema,
  updateAccommodationInquiryStatusSchema,
  updateAccommodationInquirySchema,
  accommodationInquiryIdParamSchema,
};
