const Joi = require('joi');
const { INVENTORY_CATEGORIES } = require('../../constants/tenantEnums');

// ─── Inventory Item Schema ──────────────────────────────────────────────────
const inventoryItemSchema = Joi.object({
  masterItemId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid master item ID',
      'string.length': 'Invalid master item ID',
    }),
  name: Joi.string().trim().min(2).max(100).required(),
  totalQuantity: Joi.number().integer().min(0).required(),
  availableQuantity: Joi.number().integer().min(0).required(),
  inUseQuantity: Joi.number().integer().min(0).required(),
  condition: Joi.string().trim().max(100).allow('', null),
  remarks: Joi.string().trim().max(500).allow('', null),
});

// ─── Create/Update Property Inventory Validator ────────────────────────────
const upsertPropertyInventorySchema = Joi.object({
  propertyId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid property ID',
      'string.length': 'Invalid property ID',
    }),
  items: Joi.array().items(inventoryItemSchema).min(1).required(),
});

// ─── Update Inventory Item Validator ──────────────────────────────────────
const updateInventoryItemSchema = Joi.object({
  totalQuantity: Joi.number().integer().min(0),
  availableQuantity: Joi.number().integer().min(0),
  inUseQuantity: Joi.number().integer().min(0),
  condition: Joi.string().trim().max(100).allow('', null),
  remarks: Joi.string().trim().max(500).allow('', null),
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required to update',
  });

// ─── List Property Inventory Query Validator ──────────────────────────────
const listPropertyInventoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  propertyId: Joi.string().hex().length(24),
  search: Joi.string().trim().max(200).allow(''),
  sortBy: Joi.string()
    .valid('name', 'createdAt', 'updatedAt')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// ─── ID Param Validator ──────────────────────────────────────────────────
const propertyInventoryIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid inventory ID',
      'string.length': 'Invalid inventory ID',
    }),
});

// ─── Property ID Param Validator ──────────────────────────────────────────
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
  upsertPropertyInventorySchema,
  updateInventoryItemSchema,
  listPropertyInventoryQuerySchema,
  propertyInventoryIdParamSchema,
  propertyIdParamSchema,
};