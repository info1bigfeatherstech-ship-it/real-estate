const {
  RENTAL_REQUIREMENT_TYPES,
  SHARING_REQUIREMENT_TYPES,
} = require('../constants/inquiryEnums');

const emptyToNull = (value) => {
  if (value === '' || value === undefined) return null;
  return value;
};

/**
 * Strips or nulls accommodation fields that do not apply to the selected requirement type.
 * Must run before Joi validation so empty strings on irrelevant fields do not fail.
 */
const normalizeAccommodationRequirementPayload = (payload = {}) => {
  const normalized = { ...payload };

  Object.keys(normalized).forEach((key) => {
    if (typeof normalized[key] === 'string') {
      normalized[key] = emptyToNull(normalized[key]);
    }
  });

  if (!normalized.requirementType) {
    return normalized;
  }

  if (!RENTAL_REQUIREMENT_TYPES.includes(normalized.requirementType)) {
    normalized.propertyType = null;
    normalized.bhkRequirement = null;
    normalized.tenantTypePreference = null;
  }

  if (!SHARING_REQUIREMENT_TYPES.includes(normalized.requirementType)) {
    normalized.sharingPreference = null;
  }

  return normalized;
};

module.exports = { normalizeAccommodationRequirementPayload };
