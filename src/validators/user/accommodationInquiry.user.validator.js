const Joi = require('joi');
const {
  REQUIREMENT_TYPES,
  RENTAL_REQUIREMENT_TYPES,
  SHARING_REQUIREMENT_TYPES,
  OCCUPANT_TYPES,
  GENDER_PREFERENCES,
  MONTHLY_BUDGETS,
  INQUIRY_PROPERTY_TYPES,
  BHK_REQUIREMENTS,
  TENANT_TYPE_PREFERENCES,
  INQUIRY_FOOD_PREFERENCES,
  INQUIRY_PET_PREFERENCES,
  INQUIRY_SMOKING_PREFERENCES,
  INQUIRY_ALCOHOL_PREFERENCES,
  SHARING_PREFERENCES,
  INQUIRY_FURNISHING_PREFERENCES,
  INQUIRY_AMENITIES,
  MOVE_IN_PRIORITIES,
} = require('../../constants/accommodationInquiryEnums');

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
});

const amenitiesSchema = Joi.array()
  .items(Joi.string().valid(...INQUIRY_AMENITIES))
  .unique()
  .default([]);

const inquiryPayloadSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(120),
  mobile: mobileSchema,
  email: Joi.string().trim().email({ tlds: { allow: false } }).max(160).allow('', null),
  alternativeMobile: optionalMobileSchema.allow(null, ''),
  requirementType: Joi.string().valid(...REQUIREMENT_TYPES),
  occupantType: Joi.string().valid(...OCCUPANT_TYPES),
  genderPreference: Joi.string().valid(...GENDER_PREFERENCES).allow(null),
  location: locationSchema,
  monthlyBudget: Joi.string().valid(...MONTHLY_BUDGETS),
  propertyType: Joi.string().valid(...INQUIRY_PROPERTY_TYPES).allow(null),
  bhkRequirement: Joi.string().valid(...BHK_REQUIREMENTS).allow(null),
  tenantTypePreference: Joi.string().valid(...TENANT_TYPE_PREFERENCES).allow(null),
  foodPreference: Joi.string().valid(...INQUIRY_FOOD_PREFERENCES).allow(null),
  petPreference: Joi.string().valid(...INQUIRY_PET_PREFERENCES).allow(null),
  smokingPreference: Joi.string().valid(...INQUIRY_SMOKING_PREFERENCES).allow(null),
  alcoholPreference: Joi.string().valid(...INQUIRY_ALCOHOL_PREFERENCES).allow(null),
  sharingPreference: Joi.string().valid(...SHARING_PREFERENCES).allow(null),
  furnishingPreference: Joi.string().valid(...INQUIRY_FURNISHING_PREFERENCES).allow(null),
  amenitiesRequired: amenitiesSchema,
  moveInPriority: Joi.string().valid(...MOVE_IN_PRIORITIES),
  remarks: Joi.string().trim().max(200).allow('', null),
  message: Joi.string().trim().max(1000).allow('', null),
  saveAsDraft: Joi.boolean().truthy('true', '1').falsy('false', '0').default(false),
});

const applyRequirementTypeRules = (value, helpers, { isDraft = false } = {}) => {
  if (!RENTAL_REQUIREMENT_TYPES.includes(value.requirementType)) {
    value.propertyType = null;
    value.bhkRequirement = null;
  }

  if (!SHARING_REQUIREMENT_TYPES.includes(value.requirementType)) {
    value.sharingPreference = null;
  }

  if (!isDraft && RENTAL_REQUIREMENT_TYPES.includes(value.requirementType)) {
    if (!value.propertyType && !value.bhkRequirement) {
      return helpers.error('any.custom', {
        message: 'At least one of propertyType or bhkRequirement is required for rental inquiries',
      });
    }
  }

  if (!isDraft && SHARING_REQUIREMENT_TYPES.includes(value.requirementType) && !value.sharingPreference) {
    return helpers.error('any.custom', {
      message: 'sharingPreference is required for PG or Co-Living inquiries',
    });
  }

  return value;
};

const submitAccommodationInquirySchema = inquiryPayloadSchema.custom((value, helpers) => {
  if (value.saveAsDraft) {
    if (!value.fullName) {
      return helpers.error('any.custom', { message: 'fullName is required to save a draft' });
    }
    if (!value.mobile) {
      return helpers.error('any.custom', { message: 'mobile is required to save a draft' });
    }
    return applyRequirementTypeRules(value, helpers, { isDraft: true });
  }

  const requiredFieldRules = [
    ['fullName', 'Full name is required'],
    ['mobile', 'Mobile number is required'],
    ['requirementType', 'Requirement type is required'],
    ['occupantType', 'Occupant type is required'],
    ['location', 'Preferred location is required'],
    ['monthlyBudget', 'Monthly budget is required'],
    ['moveInPriority', 'Move-in priority is required'],
  ];

  for (const [field, message] of requiredFieldRules) {
    if (value[field] === undefined || value[field] === null || value[field] === '') {
      return helpers.error('any.custom', { message });
    }
  }

  return applyRequirementTypeRules(value, helpers, { isDraft: false });
}).messages({ 'any.custom': '{{#message}}' });

module.exports = {
  submitAccommodationInquirySchema,
};
