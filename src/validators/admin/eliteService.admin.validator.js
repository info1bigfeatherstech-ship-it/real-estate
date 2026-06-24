const Joi = require('joi');
const EliteServiceConfig = require('../../models/EliteServiceConfig.model');
const { ELITE_SERVICE_STATUSES } = require('../../constants/eliteServiceEnums');

// ─── Dynamic role validation ───────────────────────────────────────────────
const validateRole = async (value, helpers) => {
  try {
    const config = await EliteServiceConfig.getConfig();
    const validRoles = config.roles || [];
    
    if (!validRoles.includes(value)) {
      return helpers.error('any.only', { 
        message: `Invalid role. Allowed roles: ${validRoles.join(', ')}` 
      });
    }
    return value;
  } catch (error) {
    // If config not found, fallback to default roles
    const defaultRoles = ['Plumber', 'Electrician', 'Carpenter', 'Painter'];
    if (!defaultRoles.includes(value)) {
      return helpers.error('any.only', {
        message: `Invalid role. Allowed roles: ${defaultRoles.join(', ')}`
      });
    }
    return value;
  }
};

const MOBILE_PATTERN = /^\+?[1-9]\d{7,14}$/;

const mobileSchema = Joi.string()
  .trim()
  .pattern(MOBILE_PATTERN)
  .messages({ 'string.pattern.base': 'Mobile number must be a valid international format' });

const optionalMobileSchema = Joi.alternatives().try(
  Joi.string().trim().valid('', null),
  mobileSchema
);

const eliteServiceFields = {
  role: Joi.string()
    .trim()
    .required()
    .external(validateRole), // ← Dynamic validation
  providerName: Joi.string().trim().min(2).max(120).required(),
  address: Joi.string().trim().min(5).max(500).required(),
  primaryMobile: mobileSchema.required(),
  secondaryMobile: optionalMobileSchema.allow(null, ''),
  status: Joi.string().valid(...ELITE_SERVICE_STATUSES),
};

// ─── Create Validator ──────────────────────────────────────────────────────
const createEliteServiceSchema = Joi.object({
  ...eliteServiceFields,
  status: eliteServiceFields.status.default('Available'),
});

// ─── Update Validator ──────────────────────────────────────────────────────
const updateEliteServiceSchema = Joi.object({
  role: Joi.string().trim().external(validateRole),
  providerName: Joi.string().trim().min(2).max(120),
  address: Joi.string().trim().min(5).max(500),
  primaryMobile: mobileSchema,
  secondaryMobile: optionalMobileSchema.allow(null, ''),
  status: Joi.string().valid(...ELITE_SERVICE_STATUSES),
})
  .min(1)
  .messages({ 'object.min': 'At least one field is required to update' });

// ─── Update Status Validator ──────────────────────────────────────────────
const updateEliteServiceStatusSchema = Joi.object({
  status: Joi.string().valid(...ELITE_SERVICE_STATUSES).required(),
});

// ─── List Query Validator ─────────────────────────────────────────────────
const listEliteServicesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).allow(''),
  role: Joi.string().trim().max(50).allow(''),
  status: Joi.string().valid(...ELITE_SERVICE_STATUSES).allow(''),
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'providerName', 'role', 'status')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// ─── ID Param Validator ────────────────────────────────────────────────────
const eliteServiceIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({ 
      'string.hex': 'Invalid elite service ID',
      'string.length': 'Invalid elite service ID' 
    }),
});

module.exports = {
  createEliteServiceSchema,
  updateEliteServiceSchema,
  updateEliteServiceStatusSchema,
  listEliteServicesQuerySchema,
  eliteServiceIdParamSchema,
};