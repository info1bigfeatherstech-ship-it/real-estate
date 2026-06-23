const Joi = require('joi');
const { INVENTORY_CATEGORIES } = require('../../constants/tenantEnums');

// ─── Create Inventory Item Validator ──────────────────────────────────────
const createInventoryItemSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Item name is required',
      'string.min': 'Item name must be at least 2 characters',
      'string.max': 'Item name cannot exceed 100 characters',
    }),
  category: Joi.string()
    .valid(...INVENTORY_CATEGORIES)
    .default('Other')
    .messages({
      'any.only': 'Invalid category. Allowed: Furniture, Appliance, Key, Accessory, Other',
    }),
});

// ─── Update Inventory Item Validator ──────────────────────────────────────
const updateInventoryItemSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Item name must be at least 2 characters',
      'string.max': 'Item name cannot exceed 100 characters',
    }),
  category: Joi.string()
    .valid(...INVENTORY_CATEGORIES)
    .messages({
      'any.only': 'Invalid category. Allowed: Furniture, Appliance, Key, Accessory, Other',
    }),
  isActive: Joi.boolean(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required to update',
  });

// ─── Toggle Status Validator ──────────────────────────────────────────────
const toggleInventoryItemStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

// ─── List Inventory Items Query Validator ────────────────────────────────
const listInventoryItemsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(200).allow(''),
  category: Joi.string().valid(...INVENTORY_CATEGORIES).allow(''),
  isActive: Joi.boolean().allow(''),
  sortBy: Joi.string()
    .valid('name', 'category', 'createdAt', 'updatedAt')
    .default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

// ─── ID Param Validator ──────────────────────────────────────────────────
const inventoryItemIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid inventory item ID',
      'string.length': 'Invalid inventory item ID',
    }),
});

module.exports = {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  toggleInventoryItemStatusSchema,
  listInventoryItemsQuerySchema,
  inventoryItemIdParamSchema,
};