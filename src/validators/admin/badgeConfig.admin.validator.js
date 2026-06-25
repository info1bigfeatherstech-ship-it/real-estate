const Joi = require('joi');

// ─── Tier Schema ────────────────────────────────────────────────────────────
const tierSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  minDeals: Joi.number().integer().min(0).required(),
  maxDeals: Joi.number().integer().min(0).allow(null),
  level: Joi.number().integer().min(1).required(),
  color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).default('#6b7280'),
  icon: Joi.string().max(10).default('🏠'),
  description: Joi.string().trim().max(200).allow('', null),
  isActive: Joi.boolean().default(true),
});

// ─── Update Config Validator ──────────────────────────────────────────────
const updateBadgeConfigSchema = Joi.object({
  tiers: Joi.array().items(tierSchema).min(1).required(),
});

// ─── Add Tier Validator ────────────────────────────────────────────────────
const addTierSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  minDeals: Joi.number().integer().min(0).required(),
  maxDeals: Joi.number().integer().min(0).allow(null),
  level: Joi.number().integer().min(1).required(),
  color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).default('#6b7280'),
  icon: Joi.string().max(10).default('🏠'),
  description: Joi.string().trim().max(200).allow('', null),
  isActive: Joi.boolean().default(true),
});

// ─── Update Tier Validator ──────────────────────────────────────────────────
const updateTierSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  minDeals: Joi.number().integer().min(0),
  maxDeals: Joi.number().integer().min(0).allow(null),
  color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/),
  icon: Joi.string().max(10),
  description: Joi.string().trim().max(200).allow('', null),
  isActive: Joi.boolean(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required to update',
  });

// ─── Toggle Status Validator ──────────────────────────────────────────────
const toggleTierStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

// ─── ID Param Validator ────────────────────────────────────────────────────
const levelParamSchema = Joi.object({
  level: Joi.number().integer().min(1).required(),
});

module.exports = {
  updateBadgeConfigSchema,
  addTierSchema,
  updateTierSchema,
  toggleTierStatusSchema,
  levelParamSchema,
};