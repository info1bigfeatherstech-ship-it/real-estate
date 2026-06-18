const Joi = require('joi');
const {
  ADMIN_INQUIRY_STATUSES,
  INQUIRY_PRIORITIES,
  INQUIRY_SOURCES,
  INQUIRY_FORM_TYPES,
} = require('../../constants/inquiryEnums');
const { CUSTOMER_ACCOUNT_TYPES } = require('../../constants/customerAccountTypes');

const objectIdSchema = Joi.string().hex().length(24);

const listInquiriesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(200).allow(''),
  status: Joi.string().valid(...ADMIN_INQUIRY_STATUSES).allow(''),
  formType: Joi.string().valid(...INQUIRY_FORM_TYPES).allow(''),
  priority: Joi.string().valid(...INQUIRY_PRIORITIES).allow(''),
  inquirySource: Joi.string().valid(...INQUIRY_SOURCES).allow(''),
  submitterAccountType: Joi.string().valid(...CUSTOMER_ACCOUNT_TYPES).allow(''),
  assignedTo: objectIdSchema.allow(''),
  city: Joi.string().trim().max(100).allow(''),
  sortBy: Joi.string().valid('createdAt', 'submittedAt', 'status', 'priority').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const inquiryStatsQuerySchema = Joi.object({
  formType: Joi.string().valid(...INQUIRY_FORM_TYPES).allow(''),
});

const inquiryIdParamSchema = Joi.object({
  id: objectIdSchema.required(),
});

const updateInquirySchema = Joi.object({
  status: Joi.string().valid(...ADMIN_INQUIRY_STATUSES),
  priority: Joi.string().valid(...INQUIRY_PRIORITIES),
  assignedTo: objectIdSchema.allow(null),
  adminNotes: Joi.string().trim().max(2000).allow('', null),
  internalRemarks: Joi.string().trim().max(2000).allow('', null),
  followUpNotes: Joi.string().trim().max(2000).allow('', null),
  inquirySource: Joi.string().valid(...INQUIRY_SOURCES),
}).min(1);

const listCustomersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(200).allow(''),
  accountType: Joi.string().valid(...CUSTOMER_ACCOUNT_TYPES).allow(''),
  isActive: Joi.string().valid('true', 'false', '').allow(''),
  emailVerified: Joi.string().valid('true', 'false', '').allow(''),
  sortBy: Joi.string().valid('createdAt', 'fullName', 'lastLoginAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const customerIdParamSchema = Joi.object({
  id: objectIdSchema.required(),
});

const updateCustomerStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

module.exports = {
  listInquiriesQuerySchema,
  inquiryStatsQuerySchema,
  inquiryIdParamSchema,
  updateInquirySchema,
  listCustomersQuerySchema,
  customerIdParamSchema,
  updateCustomerStatusSchema,
};
