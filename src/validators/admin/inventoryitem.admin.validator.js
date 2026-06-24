// src/validators/admin/inventoryitem.admin.validator.js
const Joi = require('joi');

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
  categoryId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid category ID format',
      'string.length': 'Invalid category ID format',
      'any.required': 'Category ID is required',
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
  categoryId: Joi.string()
    .hex()
    .length(24)
    .messages({
      'string.hex': 'Invalid category ID format',
      'string.length': 'Invalid category ID format',
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
  categoryId: Joi.string().hex().length(24).allow(''), // ← Also update here
  isActive: Joi.boolean().allow(''),
  sortBy: Joi.string()
    .valid('name', 'categoryId', 'createdAt', 'updatedAt')
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