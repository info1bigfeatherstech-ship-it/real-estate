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
  OCCUPATION_PREFERENCES,
  EMPLOYMENT_VERIFICATION,
  RENTAL_AGREEMENT_DURATIONS,
  MINIMUM_STAY_DURATIONS,
  LOCK_IN_PERIODS,
  AVAILABILITY_OPTIONS,
  FOOD_PREFERENCES,
  ALLOWANCE_POLICY_OPTIONS,
  GUEST_POLICY_OPTIONS,
  TENANT_VERIFICATION,
  SECURITY_DEPOSIT_OPTIONS,
  POSSESSION_STATUSES,
  LOAN_AVAILABILITY,
  PROPERTY_STATUSES,
  RENTAL_LISTING_TYPES,
  SELL_LISTING_TYPES,
  DOCUMENT_CATEGORIES,
  MEDIA_TYPES,
} = require('../../constants/propertyEnums');
const { INDIAN_STATE_NAMES } = require('../../constants/indianStateCodes');
const { assertValidDocumentTypeForCategory } = require('../../utils/documentTypeValidator');
const { listingTypeJoi } = require('../../utils/listingType');

const locationSchema = Joi.object({
  fullAddress: Joi.string().trim().max(500).allow(''),
  city: Joi.string().trim().max(100).allow(''),
  state: Joi.string().valid(...INDIAN_STATE_NAMES).allow(null),
  pincode: Joi.string().pattern(/^\d{6}$/).allow(null, ''),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
});

const rentalDetailsSchema = Joi.object({
  tenantTypeAllowed: Joi.array().items(Joi.string().valid(...TENANT_TYPES)).default([]),
  occupationPreference: Joi.string().valid(...OCCUPATION_PREFERENCES).allow(null),
  employmentVerification: Joi.array().items(Joi.string().valid(...EMPLOYMENT_VERIFICATION)).default([]),
  rentalAgreementDuration: Joi.string().valid(...RENTAL_AGREEMENT_DURATIONS).allow(null),
  minimumStayDuration: Joi.string().valid(...MINIMUM_STAY_DURATIONS).allow(null),
  lockInPeriod: Joi.string().valid(...LOCK_IN_PERIODS).allow(null),
  availability: Joi.string().valid(...AVAILABILITY_OPTIONS).allow(null),
  availabilityDate: Joi.date().iso().allow(null),
  foodPreference: Joi.string().valid(...FOOD_PREFERENCES).allow(null),
  pets: Joi.string().valid(...ALLOWANCE_POLICY_OPTIONS).allow(null),
  smoking: Joi.string().valid(...ALLOWANCE_POLICY_OPTIONS).allow(null),
  alcohol: Joi.string().valid(...ALLOWANCE_POLICY_OPTIONS).allow(null),
  guestPolicy: Joi.string().valid(...GUEST_POLICY_OPTIONS).allow(null),
  tenantVerification: Joi.array().items(Joi.string().valid(...TENANT_VERIFICATION)).default([]),
  securityDeposit: Joi.string().valid(...SECURITY_DEPOSIT_OPTIONS).allow(null),
  securityDepositCustomAmount: Joi.number().min(0).allow(null),
  preferredMoveInDate: Joi.string().valid(...AVAILABILITY_OPTIONS).allow(null),
  preferredMoveInDateSpecific: Joi.date().iso().allow(null),
  governmentEmployeePreferred: Joi.boolean().default(false),
});

const saleDetailsSchema = Joi.object({
  possessionStatus: Joi.string().valid(...POSSESSION_STATUSES).allow(null),
  loanAvailability: Joi.string().valid(...LOAN_AVAILABILITY).allow(null),
});

const basePropertySchema = {
  listingType: listingTypeJoi(LISTING_TYPES, { required: true }),
  propertyType: Joi.string().valid(...PROPERTY_TYPES).required(),
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().max(10000).allow(''),
  ownershipType: Joi.string().valid(...OWNERSHIP_TYPES).allow(null),
  condition: Joi.string().valid(...PROPERTY_CONDITIONS).allow(null),
  constructionStatus: Joi.string().valid(...CONSTRUCTION_STATUSES).allow(null),
  furnishing: Joi.string().valid(...FURNISHING_STATUSES).allow(null),
  facing: Joi.string().valid(...FACING_DIRECTIONS).allow(null),
  flooringType: Joi.string().valid(...FLOORING_TYPES).allow(null),
  area: Joi.object({
    value: Joi.number().min(0).allow(null),
    unit: Joi.string().valid('sqft').default('sqft'),
  }).default({ unit: 'sqft' }),
  price: Joi.number().min(0).required(),
  maintenance: Joi.number().min(0).allow(null),
  bedrooms: Joi.number().integer().min(0).allow(null),
  bathrooms: Joi.number().integer().min(0).allow(null),
  floorNo: Joi.number().integer().min(0).allow(null),
  totalFloors: Joi.number().integer().min(0).allow(null),
  waterSupply: Joi.string().valid(...WATER_SUPPLY_TYPES).allow(null),
  powerBackup: Joi.string().valid(...POWER_BACKUP_TYPES).allow(null),
  parkingType: Joi.string().valid(...PARKING_TYPES).allow(null),
  securityFeatures: Joi.array().items(Joi.string().valid(...SECURITY_FEATURES)).default([]),
  amenities: Joi.array().items(Joi.string().valid(...AMENITIES)).default([]),
  connectivity: Joi.array().items(Joi.string().valid(...CONNECTIVITY)).default([]),
  nearbyFacilities: Joi.array().items(Joi.string().valid(...NEARBY_FACILITIES)).default([]),
  location: locationSchema.default({}),
  rentalDetails: rentalDetailsSchema.allow(null),
  saleDetails: saleDetailsSchema.allow(null),
  status: Joi.string().valid(...PROPERTY_STATUSES).default('draft'),
};

const applyListingTypeRules = (value, helpers) => {
  const { listingType, rentalDetails, saleDetails } = value;

  if (RENTAL_LISTING_TYPES.includes(listingType)) {
    if (!rentalDetails) {
      return helpers.error('any.custom', { message: 'rentalDetails is required for rental listings' });
    }
    value.saleDetails = null;
  }

  if (SELL_LISTING_TYPES.includes(listingType)) {
    if (!saleDetails) {
      return helpers.error('any.custom', { message: 'saleDetails is required for sell listings' });
    }
    value.rentalDetails = null;
  }

  return value;
};

const createPropertySchema = Joi.object(basePropertySchema)
  .custom(applyListingTypeRules, 'Listing type conditional validation')
  .messages({ 'any.custom': '{{#message}}' });

const updatePropertySchema = Joi.object({
  ...basePropertySchema,
  listingType: listingTypeJoi(LISTING_TYPES),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
  title: Joi.string().trim().min(3).max(200),
  price: Joi.number().min(0),
})
  .min(1)
  .custom(applyListingTypeRules, 'Listing type conditional validation')
  .messages({ 'any.custom': '{{#message}}' });

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...PROPERTY_STATUSES).required(),
});

const listPropertiesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).allow(''),
  listingType: listingTypeJoi(LISTING_TYPES),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
  status: Joi.string().valid(...PROPERTY_STATUSES),
  city: Joi.string().trim().max(100),
  sortBy: Joi.string().valid('createdAt', 'price', 'title', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const uploadMediaSchema = Joi.object({
  type: Joi.string().valid(...MEDIA_TYPES).required(),
  isMain: Joi.boolean().truthy('true', '1').falsy('false', '0').default(false),
});

const updateMediaMetaSchema = Joi.object({
  type: Joi.string().valid(...MEDIA_TYPES),
  isMain: Joi.boolean().truthy('true', '1').falsy('false', '0'),
}).min(1);

const validateDocumentCategoryType = (value, helpers) => {
  const category = value.category;
  const type = value.type;

  if (category && type) {
    const errorMessage = assertValidDocumentTypeForCategory(category, type);
    if (errorMessage) {
      return helpers.error('any.custom', { message: errorMessage });
    }
  }

  return value;
};

const uploadDocumentSchema = Joi.object({
  category: Joi.string().valid(...DOCUMENT_CATEGORIES).required(),
  type: Joi.string().required(),
})
  .custom(validateDocumentCategoryType)
  .messages({ 'any.custom': '{{#message}}' });

const updateDocumentMetaSchema = Joi.object({
  category: Joi.string().valid(...DOCUMENT_CATEGORIES),
  type: Joi.string(),
})
  .min(1)
  .custom(validateDocumentCategoryType)
  .messages({ 'any.custom': '{{#message}}' });

module.exports = {
  createPropertySchema,
  updatePropertySchema,
  updateStatusSchema,
  listPropertiesQuerySchema,
  uploadMediaSchema,
  updateMediaMetaSchema,
  uploadDocumentSchema,
  updateDocumentMetaSchema,
};
