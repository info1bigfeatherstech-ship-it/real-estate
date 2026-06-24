const Joi = require('joi');

// ─── Create Inquiry Validator ──────────────────────────────────────────────
const createGeneralInquirySchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters',
  }),
  city: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'City is required',
  }),
  contactNumber: Joi.string().trim().min(10).max(20).required().messages({
    'string.empty': 'Contact number is required',
    'string.min': 'Contact number must be at least 10 digits',
  }),
  email: Joi.string().trim().email().max(160).allow('', null),
  subject: Joi.string().trim().max(200).allow('', null),
  message: Joi.string().trim().min(10).max(5000).required().messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 10 characters',
  }),
  source: Joi.string().valid('website', 'mobile_app', 'whatsapp', 'other').default('website'),
});

module.exports = {
  createGeneralInquirySchema,
};