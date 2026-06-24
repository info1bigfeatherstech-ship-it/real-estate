const Joi = require('joi');
const { KEY_TYPES, KEY_STATUS, PERSON_TYPES } = require('../../constants/keyEnums');

// ─── Create Key Validator ──────────────────────────────────────────────────
const createKeySchema = Joi.object({
  propertyId: Joi.string().hex().length(24).required(),
  keyType: Joi.string().valid(...KEY_TYPES).required(),
  keyIdentifier: Joi.string().trim().max(50).allow('', null),
  keyDescription: Joi.string().trim().max(200).allow('', null),
  totalKeys: Joi.number().integer().min(1).default(1),

  currentHolderId: Joi.string().hex().length(24).required(),
  currentHolderType: Joi.string().valid(...PERSON_TYPES).required(),
  currentHolderName: Joi.string().trim().min(2).max(120).required(),
  currentHolderMobile: Joi.string().trim().max(20).allow('', null),
});

// ─── Move Key Validator ────────────────────────────────────────────────────
const moveKeySchema = Joi.object({
  keyId: Joi.string().hex().length(24).required(),
  toPersonId: Joi.string().hex().length(24).required(),
  toPersonType: Joi.string().valid(...PERSON_TYPES).required(),
  toPersonName: Joi.string().trim().min(2).max(120).required(),
  toPersonMobile: Joi.string().trim().max(20).allow('', null),
  expectedReturnDate: Joi.date().iso().allow(null),
  notes: Joi.string().trim().max(500).allow('', null),
});

// ─── Return Key Validator ──────────────────────────────────────────────────
const returnKeySchema = Joi.object({
  keyId: Joi.string().hex().length(24).required(),
  returnedToId: Joi.string().hex().length(24).required(),
  returnedToName: Joi.string().trim().min(2).max(120).required(),
  returnNotes: Joi.string().trim().max(500).allow('', null),
});

// ─── Update Key Status Validator ──────────────────────────────────────────
const updateKeyStatusSchema = Joi.object({
  status: Joi.string().valid(...KEY_STATUS).required(),
  notes: Joi.string().trim().max(500).allow('', null),
});

// ─── List Keys Query Validator ─────────────────────────────────────────────
const listKeysQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  propertyId: Joi.string().hex().length(24).allow(''),
  status: Joi.string().valid(...KEY_STATUS).allow(''),
  keyType: Joi.string().valid(...KEY_TYPES).allow(''),
  search: Joi.string().trim().max(200).allow(''),
  sortBy: Joi.string()
    .valid('createdAt', 'keyType', 'status', 'currentHolderName')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// ─── ID Param Validator ──────────────────────────────────────────────────
const keyIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid key ID',
      'string.length': 'Invalid key ID',
    }),
});

module.exports = {
  createKeySchema,
  moveKeySchema,
  returnKeySchema,
  updateKeyStatusSchema,
  listKeysQuerySchema,
  keyIdParamSchema,
};