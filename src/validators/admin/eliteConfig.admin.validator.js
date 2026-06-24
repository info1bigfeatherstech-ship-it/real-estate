const Joi = require('joi');

// ─── Add Role Validator ────────────────────────────────────────────────────
const addRoleSchema = Joi.object({
  role: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Role name is required',
    'string.min': 'Role name must be at least 2 characters',
    'string.max': 'Role name cannot exceed 50 characters',
  }),
});

// ─── Update Role Validator ─────────────────────────────────────────────────
const updateRoleSchema = Joi.object({
  oldRole: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Old role name is required',
  }),
  newRole: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'New role name is required',
  }),
});

// ─── Delete Role Validator ─────────────────────────────────────────────────
const deleteRoleSchema = Joi.object({
  roleName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Role name is required',
  }),
});

module.exports = {
  addRoleSchema,
  updateRoleSchema,
  deleteRoleSchema,
};