const Joi = require('joi');
const {
  ELITE_SERVICE_ROLES,
  ELITE_SERVICE_STATUSES,
} = require('../../constants/eliteServiceEnums');

const MOBILE_PATTERN = /^\+?[1-9]\d{7,14}$/;

const mobileSchema = Joi.string()
  .trim()
  .pattern(MOBILE_PATTERN)
  .messages({ 'string.pattern.base': 'Mobile number must be a valid international format (e.g. +919876543210)' });

const optionalMobileSchema = Joi.alternatives().try(
  Joi.string().trim().valid('', null),
  mobileSchema
);

const eliteServiceFields = {
  role: Joi.string().valid(...ELITE_SERVICE_ROLES),
  providerName: Joi.string().trim().min(2).max(120),
  address: Joi.string().trim().min(5).max(500),
  primaryMobile: mobileSchema,
  secondaryMobile: optionalMobileSchema.allow(null, ''),
  status: Joi.string().valid(...ELITE_SERVICE_STATUSES),
};

const createEliteServiceSchema = Joi.object({
  role: eliteServiceFields.role.required(),
  providerName: eliteServiceFields.providerName.required(),
  address: eliteServiceFields.address.required(),
  primaryMobile: eliteServiceFields.primaryMobile.required(),
  secondaryMobile: eliteServiceFields.secondaryMobile.default(null),
  status: eliteServiceFields.status.default('Available'),
});

const updateEliteServiceSchema = Joi.object({
  ...eliteServiceFields,
})
  .min(1)
  .messages({ 'object.min': 'At least one field is required to update' });

const updateEliteServiceStatusSchema = Joi.object({
  status: Joi.string().valid(...ELITE_SERVICE_STATUSES).required(),
});

const listEliteServicesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).allow(''),
  role: Joi.string().valid(...ELITE_SERVICE_ROLES),
  status: Joi.string().valid(...ELITE_SERVICE_STATUSES),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'providerName', 'role', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const eliteServiceIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({ 'string.hex': 'Invalid elite service ID', 'string.length': 'Invalid elite service ID' }),
});

module.exports = {
  createEliteServiceSchema,
  updateEliteServiceSchema,
  updateEliteServiceStatusSchema,
  listEliteServicesQuerySchema,
  eliteServiceIdParamSchema,
};
