const Joi = require('joi');
const { OCCUPANT_TYPES, ENTRY_STATUSES } = require('../../constants/tenantEnums');

// ─── Keys Schema ──────────────────────────────────────────────────────────
const keysSchema = Joi.object({
  mainDoor: Joi.object({ count: Joi.number().integer().min(0).default(0) }),
  room: Joi.object({ count: Joi.number().integer().min(0).default(0) }),
  cupboard: Joi.object({ count: Joi.number().integer().min(0).default(0) }),
  drawer: Joi.object({ count: Joi.number().integer().min(0).default(0) }),
  accessCard: Joi.object({ count: Joi.number().integer().min(0).default(0) }),
  parkingRemote: Joi.object({ count: Joi.number().integer().min(0).default(0) }),
  other: Joi.string().trim().max(200).allow('', null),
});

// ─── Meters Schema ──────────────────────────────────────────────────────
const metersSchema = Joi.object({
  electricity: Joi.number().min(0).default(0),
  water: Joi.number().min(0).default(0),
  gas: Joi.number().min(0).default(0),
});

// ─── Item Schema ────────────────────────────────────────────────────────
const itemSchema = Joi.object({
  inventoryItemId: Joi.string().hex().length(24).required(),
  name: Joi.string().trim().min(2).max(100).required(),
  quantity: Joi.number().integer().min(1).default(1),
  condition: Joi.string().trim().max(100).default('Good'),
});

// ─── Property Condition Schema ──────────────────────────────────────────
const propertyConditionSchema = Joi.object({
  walls: Joi.string().trim().max(500).allow('', null),
  floor: Joi.string().trim().max(500).allow('', null),
  doors: Joi.string().trim().max(500).allow('', null),
  windows: Joi.string().trim().max(500).allow('', null),
  bathroom: Joi.string().trim().max(500).allow('', null),
  kitchen: Joi.string().trim().max(500).allow('', null),
});

// ─── Photos Schema ──────────────────────────────────────────────────────
const photosSchema = Joi.object({
  room: Joi.array().items(Joi.string().uri()),
  furniture: Joi.array().items(Joi.string().uri()),
  appliance: Joi.array().items(Joi.string().uri()),
  meter: Joi.array().items(Joi.string().uri()),
});

// ─── Remarks Schema ─────────────────────────────────────────────────────
const remarksSchema = Joi.object({
  existingDamage: Joi.string().trim().max(2000).allow('', null),
  missingItems: Joi.string().trim().max(2000).allow('', null),
});

// ─── Create Tenant Entry Validator ──────────────────────────────────────
const createTenantEntrySchema = Joi.object({
  tenantName: Joi.string().trim().min(2).max(120).required(),
  mobile: Joi.string().trim().min(10).max(20).required(),
  email: Joi.string().trim().email().max(160).allow('', null),
  occupantType: Joi.string().valid(...OCCUPANT_TYPES).required(),

  propertyId: Joi.string().hex().length(24).required(),
  roomNumber: Joi.string().trim().max(50).allow('', null),
  bedNumber: Joi.string().trim().max(50).allow('', null),
  propertyAddress: Joi.string().trim().max(500).allow('', null),

  agreementStartDate: Joi.date().iso().required(),
  agreementEndDate: Joi.date().iso().required(),
  monthlyRent: Joi.number().min(0).required(),
  securityDeposit: Joi.number().min(0).required(),
  lockInPeriod: Joi.string().trim().max(50).allow('', null),

  handoverDate: Joi.date().iso().allow(null),
  possessionDate: Joi.date().iso().allow(null),
  possessionTime: Joi.string().trim().max(20).allow('', null),

  keys: keysSchema.default({}),
  meters: metersSchema.default({}),
  furniture: Joi.array().items(itemSchema).default([]),
  appliances: Joi.array().items(itemSchema).default([]),
  propertyCondition: propertyConditionSchema.default({}),
  photos: photosSchema.default({}),
  remarks: remarksSchema.default({}),

  tenantSignature: Joi.string().trim().max(200).allow('', null),
  signatureDate: Joi.date().iso().allow(null),

  status: Joi.string().valid(...ENTRY_STATUSES).default('active'),
});

// ─── Update Tenant Entry Validator ──────────────────────────────────────
const updateTenantEntrySchema = Joi.object({
  tenantName: Joi.string().trim().min(2).max(120),
  mobile: Joi.string().trim().min(10).max(20),
  email: Joi.string().trim().email().max(160).allow('', null),
  occupantType: Joi.string().valid(...OCCUPANT_TYPES),

  roomNumber: Joi.string().trim().max(50).allow('', null),
  bedNumber: Joi.string().trim().max(50).allow('', null),
  propertyAddress: Joi.string().trim().max(500).allow('', null),

  agreementStartDate: Joi.date().iso(),
  agreementEndDate: Joi.date().iso(),
  monthlyRent: Joi.number().min(0),
  securityDeposit: Joi.number().min(0),
  lockInPeriod: Joi.string().trim().max(50).allow('', null),

  handoverDate: Joi.date().iso().allow(null),
  possessionDate: Joi.date().iso().allow(null),
  possessionTime: Joi.string().trim().max(20).allow('', null),

  keys: keysSchema,
  meters: metersSchema,
  furniture: Joi.array().items(itemSchema),
  appliances: Joi.array().items(itemSchema),
  propertyCondition: propertyConditionSchema,
  photos: photosSchema,
  remarks: remarksSchema,

  tenantSignature: Joi.string().trim().max(200).allow('', null),
  signatureDate: Joi.date().iso().allow(null),

  status: Joi.string().valid(...ENTRY_STATUSES),
})
  .min(1)
  .messages({ 'object.min': 'At least one field is required to update' });

// ─── List Tenant Entries Query Validator ──────────────────────────────
const listTenantEntriesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(200).allow(''),
  propertyId: Joi.string().hex().length(24).allow(''),
  status: Joi.string().valid(...ENTRY_STATUSES).allow(''),
  occupantType: Joi.string().valid(...OCCUPANT_TYPES).allow(''),
  sortBy: Joi.string()
    .valid('tenantName', 'createdAt', 'agreementStartDate', 'status')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// ─── ID Param Validator ──────────────────────────────────────────────────
const tenantEntryIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid tenant entry ID',
      'string.length': 'Invalid tenant entry ID',
    }),
});

// ─── Property ID Param Validator ────────────────────────────────────────
const propertyIdParamSchema = Joi.object({
  propertyId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid property ID',
      'string.length': 'Invalid property ID',
    }),
});

module.exports = {
  createTenantEntrySchema,
  updateTenantEntrySchema,
  listTenantEntriesQuerySchema,
  tenantEntryIdParamSchema,
  propertyIdParamSchema,
};