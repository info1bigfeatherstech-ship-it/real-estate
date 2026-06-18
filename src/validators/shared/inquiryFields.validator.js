const Joi = require('joi');

const MOBILE_PATTERN = /^(\+91|91)?[6-9]\d{9}$/;

const mobileSchema = Joi.string()
  .trim()
  .custom((value, helpers) => {
    const digits = value.replace(/\s+/g, '');
    if (!MOBILE_PATTERN.test(digits)) {
      return helpers.error('any.custom', { message: 'Mobile number must be a valid 10-digit Indian number' });
    }
    if (digits.startsWith('+91')) return digits;
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
    return `+91${digits.replace(/^91/, '')}`;
  })
  .messages({ 'any.custom': '{{#message}}' });

const optionalMobileSchema = Joi.alternatives().try(
  Joi.string().trim().valid('', null),
  mobileSchema
);

const locationSchema = Joi.object({
  city: Joi.string().trim().min(2).max(100).required(),
  area: Joi.string().trim().min(2).max(200).required(),
  landmark: Joi.string().trim().max(200).allow('', null),
  address: Joi.string().trim().max(500).allow('', null),
});

const contactSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(120),
  mobile: mobileSchema,
  email: Joi.string().trim().email({ tlds: { allow: false } }).max(160).allow('', null),
  alternativeMobile: optionalMobileSchema.allow(null, ''),
});

const remarksSchema = Joi.string().trim().max(2000).allow('', null);
const messageSchema = Joi.string().trim().max(5000).allow('', null);

const propertySizeSchema = Joi.object({
  value: Joi.number().positive().allow(null),
  unit: Joi.string().trim().max(30).allow(null, ''),
}).allow(null);

module.exports = {
  mobileSchema,
  optionalMobileSchema,
  locationSchema,
  contactSchema,
  remarksSchema,
  messageSchema,
  propertySizeSchema,
};
