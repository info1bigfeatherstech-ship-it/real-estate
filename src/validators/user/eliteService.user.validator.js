const Joi = require('joi');
const {
  ELITE_SERVICE_ROLES,
  ELITE_SERVICE_STATUSES,
} = require('../../constants/eliteServiceEnums');

const listEliteServicesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  search: Joi.string().trim().max(200).allow(''),
  role: Joi.string().valid(...ELITE_SERVICE_ROLES),
  status: Joi.string().valid(...ELITE_SERVICE_STATUSES),
  sortBy: Joi.string().valid('providerName', 'role', 'status', 'createdAt').default('providerName'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

const eliteServiceIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({ 'string.hex': 'Invalid elite service ID', 'string.length': 'Invalid elite service ID' }),
});

module.exports = {
  listEliteServicesQuerySchema,
  eliteServiceIdParamSchema,
};
