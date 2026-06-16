const Joi = require('joi');
const {
  LISTING_TYPES,
  PROPERTY_TYPES,
  OWNERSHIP_TYPES,
  PROPERTY_CONDITIONS,
  CONSTRUCTION_STATUSES,
  FURNISHING_STATUSES,
  FACING_DIRECTIONS,
  FLOORING_TYPES,
  WATER_SUPPLY_TYPES,
  POWER_BACKUP_TYPES,
  PARKING_TYPES,
  SECURITY_FEATURES,
  AMENITIES,
  CONNECTIVITY,
  NEARBY_FACILITIES,
  TENANT_TYPES,
  AVAILABILITY_OPTIONS,
  FOOD_PREFERENCES,
  ALLOWANCE_POLICY_OPTIONS,
  GUEST_POLICY_OPTIONS,
  SECURITY_DEPOSIT_OPTIONS,
  POSSESSION_STATUSES,
  LOAN_AVAILABILITY,
} = require('../../constants/propertyEnums');
const { INDIAN_STATE_NAMES } = require('../../constants/indianStateCodes');

const ARRAY_MATCH_MODES = ['any', 'all'];

const commaSeparatedEnum = (validValues, fieldLabel) =>
  Joi.string()
    .trim()
    .custom((value, helpers) => {
      const items = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      if (!items.length) return helpers.error('any.invalid');

      const invalid = items.find((item) => !validValues.includes(item));
      if (invalid) {
        return helpers.error('any.custom', {
          message: `Invalid ${fieldLabel} value: "${invalid}"`,
        });
      }
      return items;
    });

const validateRange = (value, helpers, minKey, maxKey, label) => {
  const min = value[minKey];
  const max = value[maxKey];
  if (min !== undefined && max !== undefined && min > max) {
    return helpers.error('any.custom', {
      message: `${label}: minimum cannot exceed maximum`,
    });
  }
  return value;
};

const listPropertiesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  search: Joi.string().trim().max(200).allow(''),
  listingType: Joi.string().valid(...LISTING_TYPES),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
  city: Joi.string().trim().max(100),
  state: Joi.string().valid(...INDIAN_STATE_NAMES),
  pincode: Joi.string().pattern(/^\d{6}$/),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  minArea: Joi.number().min(0),
  maxArea: Joi.number().min(0),
  minMaintenance: Joi.number().min(0),
  maxMaintenance: Joi.number().min(0),
  bedrooms: Joi.number().integer().min(0),
  minBedrooms: Joi.number().integer().min(0),
  maxBedrooms: Joi.number().integer().min(0),
  bathrooms: Joi.number().integer().min(0),
  minBathrooms: Joi.number().integer().min(0),
  maxBathrooms: Joi.number().integer().min(0),
  floorNo: Joi.number().integer().min(0),
  minFloorNo: Joi.number().integer().min(0),
  maxFloorNo: Joi.number().integer().min(0),
  totalFloors: Joi.number().integer().min(0),
  ownershipType: Joi.string().valid(...OWNERSHIP_TYPES),
  condition: Joi.string().valid(...PROPERTY_CONDITIONS),
  constructionStatus: Joi.string().valid(...CONSTRUCTION_STATUSES),
  furnishing: Joi.string().valid(...FURNISHING_STATUSES),
  facing: Joi.string().valid(...FACING_DIRECTIONS),
  flooringType: Joi.string().valid(...FLOORING_TYPES),
  waterSupply: Joi.string().valid(...WATER_SUPPLY_TYPES),
  powerBackup: Joi.string().valid(...POWER_BACKUP_TYPES),
  parkingType: Joi.string().valid(...PARKING_TYPES),
  amenities: commaSeparatedEnum(AMENITIES, 'amenities'),
  amenitiesMode: Joi.string().valid(...ARRAY_MATCH_MODES).default('any'),
  securityFeatures: commaSeparatedEnum(SECURITY_FEATURES, 'securityFeatures'),
  securityFeaturesMode: Joi.string().valid(...ARRAY_MATCH_MODES).default('any'),
  connectivity: commaSeparatedEnum(CONNECTIVITY, 'connectivity'),
  connectivityMode: Joi.string().valid(...ARRAY_MATCH_MODES).default('any'),
  nearbyFacilities: commaSeparatedEnum(NEARBY_FACILITIES, 'nearbyFacilities'),
  nearbyFacilitiesMode: Joi.string().valid(...ARRAY_MATCH_MODES).default('any'),
  tenantTypeAllowed: commaSeparatedEnum(TENANT_TYPES, 'tenantTypeAllowed'),
  availability: Joi.string().valid(...AVAILABILITY_OPTIONS),
  preferredMoveInDate: Joi.string().valid(...AVAILABILITY_OPTIONS),
  foodPreference: Joi.string().valid(...FOOD_PREFERENCES),
  pets: Joi.string().valid(...ALLOWANCE_POLICY_OPTIONS),
  smoking: Joi.string().valid(...ALLOWANCE_POLICY_OPTIONS),
  alcohol: Joi.string().valid(...ALLOWANCE_POLICY_OPTIONS),
  guestPolicy: Joi.string().valid(...GUEST_POLICY_OPTIONS),
  securityDeposit: Joi.string().valid(...SECURITY_DEPOSIT_OPTIONS),
  governmentEmployeePreferred: Joi.boolean().truthy('true', '1').falsy('false', '0'),
  possessionStatus: Joi.string().valid(...POSSESSION_STATUSES),
  loanAvailability: Joi.string().valid(...LOAN_AVAILABILITY),
  sortBy: Joi.string()
    .valid('publishedAt', 'price', 'createdAt', 'area.value', 'title')
    .default('publishedAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
})
  .custom((value, helpers) => validateRange(value, helpers, 'minPrice', 'maxPrice', 'price'))
  .custom((value, helpers) => validateRange(value, helpers, 'minArea', 'maxArea', 'area'))
  .custom((value, helpers) => validateRange(value, helpers, 'minMaintenance', 'maxMaintenance', 'maintenance'))
  .custom((value, helpers) => validateRange(value, helpers, 'minBedrooms', 'maxBedrooms', 'bedrooms'))
  .custom((value, helpers) => validateRange(value, helpers, 'minBathrooms', 'maxBathrooms', 'bathrooms'))
  .custom((value, helpers) => validateRange(value, helpers, 'minFloorNo', 'maxFloorNo', 'floorNo'))
  .messages({ 'any.custom': '{{#message}}' });

const propertyIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({ 'string.hex': 'Invalid property ID', 'string.length': 'Invalid property ID' }),
});

const listingIdParamSchema = Joi.object({
  listingId: Joi.string()
    .trim()
    .pattern(/^EA-\d{5}-[A-F0-9]{6}$/i)
    .required()
    .messages({ 'string.pattern.base': 'Invalid listing ID format' }),
});

const relatedPropertiesQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(12).default(6),
});

module.exports = {
  listPropertiesQuerySchema,
  propertyIdParamSchema,
  listingIdParamSchema,
  relatedPropertiesQuerySchema,
};
