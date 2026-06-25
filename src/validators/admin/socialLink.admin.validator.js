const Joi = require('joi');
const { SOCIAL_PLATFORMS } = require('../../constants/socialEnums');

// ─── URL Validator ──────────────────────────────────────────────────────────
const urlSchema = Joi.string()
  .trim()
  .max(500)
  .required()
  .custom((value, helpers) => {
    try {
      new URL(value);
      return value;
    } catch {
      return helpers.error('any.custom', { message: 'Invalid URL format' });
    }
  });

// ─── Create Social Link Validator ──────────────────────────────────────────
const createSocialLinkSchema = Joi.object({
  platform: Joi.string()
    .valid(...SOCIAL_PLATFORMS)
    .required()
    .messages({
      'any.only': 'Invalid platform. Allowed: facebook, instagram, youtube, linkedin, twitter, whatsapp, tiktok, pinterest, telegram, other',
      'any.required': 'Platform is required',
    }),
  label: Joi.string().trim().max(50).allow('', null),
  url: urlSchema,
  icon: Joi.string().trim().max(50).allow('', null),
  isActive: Joi.boolean().default(true),
  displayOrder: Joi.number().integer().min(0).default(0),
});

// ─── Update Social Link Validator ──────────────────────────────────────────
const updateSocialLinkSchema = Joi.object({
  platform: Joi.string().valid(...SOCIAL_PLATFORMS),
  label: Joi.string().trim().max(50).allow('', null),
  url: urlSchema,
  icon: Joi.string().trim().max(50).allow('', null),
  isActive: Joi.boolean(),
  displayOrder: Joi.number().integer().min(0),
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required to update',
  });

// ─── Toggle Status Validator ──────────────────────────────────────────────
const toggleSocialLinkStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

// ─── ID Param Validator ──────────────────────────────────────────────────
const socialLinkIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Invalid social link ID',
      'string.length': 'Invalid social link ID',
    }),
});

module.exports = {
  createSocialLinkSchema,
  updateSocialLinkSchema,
  toggleSocialLinkStatusSchema,
  socialLinkIdParamSchema,
};