const Joi = require('joi');
const {
  EXIT_REASONS,
  HANDOVER_STATUSES,
  CONDITION_OPTIONS,
  YES_NO,
} = require('../../constants/tenantEnums');

// ─── Condition Schema ──────────────────────────────────────────────────────
const conditionSchema = Joi.object({
  condition: Joi.string().valid(...CONDITION_OPTIONS).default('Good'),
  remarks: Joi.string().trim().max(500).allow('', null),
});

// ─── Inventory Verification Schema ────────────────────────────────────────
const inventoryVerificationSchema = Joi.object({
  given: Joi.number().integer().min(0).default(0),
  returned: Joi.string().valid(...YES_NO).default('No'),
  condition: Joi.string().valid(...CONDITION_OPTIONS).default('Good'),
  remarks: Joi.string().trim().max(500).allow('', null),
});

// ─── Exit Meters Schema ──────────────────────────────────────────────────
const exitMetersSchema = Joi.object({
  electricity: Joi.number().min(0).default(0),
  water: Joi.number().min(0).default(0),
  gas: Joi.number().min(0).default(0),
});

// ─── Charges Schema ──────────────────────────────────────────────────────
const chargesSchema = Joi.object({
  pendingRent: Joi.number().min(0).default(0),
  electricityCharges: Joi.number().min(0).default(0),
  waterCharges: Joi.number().min(0).default(0),
  maintenanceCharges: Joi.number().min(0).default(0),
  damageCharges: Joi.number().min(0).default(0),
  cleaningCharges: Joi.number().min(0).default(0),
  otherCharges: Joi.number().min(0).default(0),
  totalDeductions: Joi.number().min(0).default(0),
});

// ─── Security Deposit Schema ──────────────────────────────────────────────
const securityDepositSchema = Joi.object({
  depositAmount: Joi.number().min(0).default(0),
  amountDeducted: Joi.number().min(0).default(0),
  refundAmount: Joi.number().min(0).default(0),
});

// ─── Property Condition at Exit Schema ──────────────────────────────────
const propertyConditionExitSchema = Joi.object({
  walls: conditionSchema.default({}),
  floor: conditionSchema.default({}),
  doors: conditionSchema.default({}),
  windows: conditionSchema.default({}),
  bathroom: conditionSchema.default({}),
  kitchen: conditionSchema.default({}),
});

// ─── Exit Photos Schema ──────────────────────────────────────────────────
const exitPhotosSchema = Joi.object({
  room: Joi.array().items(Joi.string().uri()).default([]),
  damage: Joi.array().items(Joi.string().uri()).default([]),
  meter: Joi.array().items(Joi.string().uri()).default([]),
});

// ─── Dynamic Inventory Schema ─────────────────────────────────────────────
const inventoryDynamicSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  given: Joi.number().integer().min(0).default(0),
  returned: Joi.string().valid(...YES_NO).default('No'),
  condition: Joi.string().valid(...CONDITION_OPTIONS).default('Good'),
  remarks: Joi.string().trim().max(500).allow('', null),
});

// ─── Create Tenant Exit Validator ─────────────────────────────────────────
const createTenantExitSchema = Joi.object({
  entryRecordId: Joi.string().hex().length(24).required(),

  exitDate: Joi.date().iso().required(),
  exitTime: Joi.string().trim().max(20).allow('', null),
  reasonForLeaving: Joi.string().valid(...EXIT_REASONS).required(),
  reasonOther: Joi.string().trim().max(200).allow('', null),

  inventory: Joi.object({
    mainKey: inventoryVerificationSchema.default({}),
    bed: inventoryVerificationSchema.default({}),
    mattress: inventoryVerificationSchema.default({}),
    chair: inventoryVerificationSchema.default({}),
    wardrobe: inventoryVerificationSchema.default({}),
    acRemote: inventoryVerificationSchema.default({}),
    wifiRouter: inventoryVerificationSchema.default({}),
  }).default({}),

  inventoryDynamic: Joi.array().items(inventoryDynamicSchema).default([]),

  exitMeters: exitMetersSchema.default({}),
  charges: chargesSchema.default({}),
  securityDeposit: securityDepositSchema.default({}),

  propertyCondition: propertyConditionExitSchema.default({}),

  missingItemsList: Joi.string().trim().max(2000).allow('', null),
  damageNotes: Joi.string().trim().max(2000).allow('', null),

  exitPhotos: exitPhotosSchema.default({}),

  handoverStatus: Joi.string().valid(...HANDOVER_STATUSES).default('Pending Verification'),

  tenantSignature: Joi.string().trim().max(200).allow('', null),
  propertyManagerSignature: Joi.string().trim().max(200).allow('', null),
  handoverDate: Joi.date().iso().allow(null),
});

// ─── Update Tenant Exit Validator ─────────────────────────────────────────
const updateTenantExitSchema = Joi.object({
  exitDate: Joi.date().iso(),
  exitTime: Joi.string().trim().max(20).allow('', null),
  reasonForLeaving: Joi.string().valid(...EXIT_REASONS),
  reasonOther: Joi.string().trim().max(200).allow('', null),

  inventory: Joi.object({
    mainKey: inventoryVerificationSchema,
    bed: inventoryVerificationSchema,
    mattress: inventoryVerificationSchema,
    chair: inventoryVerificationSchema,
    wardrobe: inventoryVerificationSchema,
    acRemote: inventoryVerificationSchema,
    wifiRouter: inventoryVerificationSchema,
  }),

  inventoryDynamic: Joi.array().items(inventoryDynamicSchema),

  exitMeters: exitMetersSchema,
  charges: chargesSchema,
  securityDeposit: securityDepositSchema,

  propertyCondition: propertyConditionExitSchema,

  missingItemsList: Joi.string().trim().max(2000).allow('', null),
  damageNotes: Joi.string().trim().max(2000).allow('', null),

  exitPhotos: exitPhotosSchema,

  handoverStatus: Joi.string().valid(...HANDOVER_STATUSES),

  tenantSignature: Joi.string().trim().max(200).allow('', null),
  propertyManagerSignature: Joi.string().trim().max(200).allow('', null),
  handoverDate: Joi.date().iso().allow(null),
})
  .min(1)
  .messages({ 'object.min': 'At least one field is required to update' });

// ─── List Tenant Exits Query Validator ──────────────────────────────────
const listTenantExitsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(200).allow(''),
  propertyId: Joi.string().hex().length(24).allow(''),
  handoverStatus: Joi.string().valid(...HANDOVER_STATUSES).allow(''),
  sortBy: Joi.string()
    .valid('tenantName', 'exitDate', 'createdAt', 'handoverStatus')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// ─── ID Param Validator ──────────────────────────────────────────────────
const tenantExitIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid tenant exit ID',
      'string.length': 'Invalid tenant exit ID',
    }),
});

// ─── Entry Record ID Param Validator ────────────────────────────────────
const entryRecordIdParamSchema = Joi.object({
  entryId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid entry record ID',
      'string.length': 'Invalid entry record ID',
    }),
});

module.exports = {
  createTenantExitSchema,
  updateTenantExitSchema,
  listTenantExitsQuerySchema,
  tenantExitIdParamSchema,
  entryRecordIdParamSchema,
};