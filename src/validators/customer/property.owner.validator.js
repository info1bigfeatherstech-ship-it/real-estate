const Joi = require('joi');
const {
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
  RENTAL_LISTING_TYPES,
  SELL_LISTING_TYPES,
} = require('../../constants/propertyEnums');
const { INDIAN_STATE_NAMES } = require('../../constants/indianStateCodes');
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
  listingType: listingTypeJoi(['For Sell', 'For Rent', 'BUY', 'PG'], { required: true }),
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
  roi: Joi.number().min(0).max(100).allow(null),
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

// ─── Create Property Validator ──────────────────────────────────────────────
const createOwnerPropertySchema = Joi.object(basePropertySchema)
  .custom(applyListingTypeRules, 'Listing type conditional validation')
  .messages({ 'any.custom': '{{#message}}' });

// ─── Update Property Validator ──────────────────────────────────────────────
const updateOwnerPropertySchema = Joi.object({
  ...basePropertySchema,
  listingType: listingTypeJoi(['For Sell', 'For Rent', 'BUY', 'PG']),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
  title: Joi.string().trim().min(3).max(200),
  price: Joi.number().min(0),
})
  .min(1)
  .custom(applyListingTypeRules, 'Listing type conditional validation')
  .messages({ 'any.custom': '{{#message}}' });

// ─── Update Status Validator ──────────────────────────────────────────────
const updateOwnerPropertyStatusSchema = Joi.object({
  status: Joi.string()
    .valid('draft', 'active', 'inactive', 'rented', 'occupied', 'sold')
    .required(),
});

// ─── List Properties Query Validator ──────────────────────────────────────
const listOwnerPropertiesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).allow(''),
  listingType: listingTypeJoi(['For Sell', 'For Rent', 'BUY', 'PG']),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
  status: Joi.string().valid('draft', 'pending', 'active', 'rejected', 'inactive', 'rented', 'occupied', 'sold'),
  city: Joi.string().trim().max(100),
  sortBy: Joi.string().valid('createdAt', 'price', 'title', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// ─── ID Param Validator ──────────────────────────────────────────────────
const ownerPropertyIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({ 'string.hex': 'Invalid property ID', 'string.length': 'Invalid property ID' }),
});

module.exports = {
  createOwnerPropertySchema,
  updateOwnerPropertySchema,
  updateOwnerPropertyStatusSchema,
  listOwnerPropertiesQuerySchema,
  ownerPropertyIdParamSchema,
};