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
  BUY_PROPERTY_TYPES,
  INTENDED_USES,
  BUY_BUDGET_RANGES,
  BUY_BHK_REQUIREMENTS,
  AREA_UNITS,
  PROPERTY_STATUS_PREFERENCES,
  BUY_PRIORITY_TIMELINES,
  BUY_AMENITIES,
  SELL_PROPERTY_TYPES,
  PROPERTY_SUITABLE_FOR,
  SELL_BHK_OPTIONS,
  FACING_DIRECTIONS,
  SELL_PROPERTY_CONDITIONS,
  OWNERSHIP_TYPES,
  LEGAL_DOCUMENT_TYPES,
  TITLE_STATUSES,
  ADDITIONAL_DOCUMENTS,
  DOCUMENT_STATUSES,
  SELL_PRIORITY_TIMELINES,
  YES_NO,
  LISTING_TYPES,
  LISTING_PROPERTY_TYPES,
  OCCUPANT_SUITABILITY,
  BUSINESS_USE_TYPES,
  LISTING_AREA_UNITS,
  LISTING_BHK_OPTIONS,
  AVAILABLE_FROM_OPTIONS,
  LISTING_URGENCY_OPTIONS,
  LISTING_AMENITIES,
} = require('../../constants/inquiryEnums');
const {
  locationSchema,
  contactSchema,
  remarksSchema,
  messageSchema,
  propertySizeSchema,
} = require('../shared/inquiryFields.validator');
const { normalizeAccommodationRequirementPayload } = require('../../utils/normalizeAccommodationRequirementPayload');

const saveAsDraftSchema = Joi.boolean().truthy('true', '1').falsy('false', '0').default(false);

const baseInquirySchema = Joi.object({
  contact: contactSchema,
  location: locationSchema.allow(null),
  remarks: remarksSchema,
  message: messageSchema,
  saveAsDraft: saveAsDraftSchema,
});

const amenitiesArray = (values) =>
  Joi.array().items(Joi.string().valid(...values)).unique().default([]);

const optionalEnum = (values) =>
  Joi.string().valid(...values).allow(null).empty('').default(null);

// ── Accommodation Requirement ──
const accommodationRequirementPayloadSchema = Joi.object({
  requirementType: Joi.string().valid(...REQUIREMENT_TYPES),
  occupantType: Joi.string().valid(...OCCUPANT_TYPES),
  genderPreference: optionalEnum(GENDER_PREFERENCES),
  monthlyBudget: Joi.string().valid(...MONTHLY_BUDGETS),
  propertyType: optionalEnum(INQUIRY_PROPERTY_TYPES),
  bhkRequirement: optionalEnum(BHK_REQUIREMENTS),
  tenantTypePreference: optionalEnum(TENANT_TYPE_PREFERENCES),
  foodPreference: optionalEnum(INQUIRY_FOOD_PREFERENCES),
  petPreference: optionalEnum(INQUIRY_PET_PREFERENCES),
  smokingPreference: optionalEnum(INQUIRY_SMOKING_PREFERENCES),
  alcoholPreference: optionalEnum(INQUIRY_ALCOHOL_PREFERENCES),
  sharingPreference: optionalEnum(SHARING_PREFERENCES),
  furnishingPreference: optionalEnum(INQUIRY_FURNISHING_PREFERENCES),
  amenitiesRequired: amenitiesArray(INQUIRY_AMENITIES),
  moveInPriority: Joi.string().valid(...MOVE_IN_PRIORITIES),
});

const applyAccommodationRequirementRules = (payload, helpers, isDraft) => {
  if (!RENTAL_REQUIREMENT_TYPES.includes(payload.requirementType)) {
    payload.propertyType = null;
    payload.bhkRequirement = null;
  }
  if (!SHARING_REQUIREMENT_TYPES.includes(payload.requirementType)) {
    payload.sharingPreference = null;
  }
  if (!isDraft && RENTAL_REQUIREMENT_TYPES.includes(payload.requirementType)) {
    if (!payload.propertyType && !payload.bhkRequirement) {
      return helpers.error('any.custom', {
        message: 'At least one of propertyType or bhkRequirement is required for rental inquiries',
      });
    }
  }
  if (!isDraft && SHARING_REQUIREMENT_TYPES.includes(payload.requirementType) && !payload.sharingPreference) {
    return helpers.error('any.custom', {
      message: 'sharingPreference is required for PG or Co-Living inquiries',
    });
  }
  return payload;
};

const submitAccommodationRequirementSchema = baseInquirySchema
  .keys({ payload: accommodationRequirementPayloadSchema.default({}) })
  .custom((value, helpers) => {
    const isDraft = Boolean(value.saveAsDraft);

    if (value.payload?.requirementType) {
      value.payload = normalizeAccommodationRequirementPayload(value.payload);
    }

    if (isDraft) {
      if (!value.contact?.fullName) {
        return helpers.error('any.custom', { message: 'Full name is required to save a draft' });
      }
      if (!value.contact?.mobile) {
        return helpers.error('any.custom', { message: 'Mobile number is required to save a draft' });
      }
      value.payload = applyAccommodationRequirementRules({ ...value.payload }, helpers, true);
      if (value.payload instanceof Error) return value.payload;
      return value;
    }

    const required = [
      ['contact.fullName', value.contact?.fullName, 'Full name is required'],
      ['contact.mobile', value.contact?.mobile, 'Mobile number is required'],
      ['payload.requirementType', value.payload?.requirementType, 'Requirement type is required'],
      ['payload.occupantType', value.payload?.occupantType, 'Occupant type is required'],
      ['location', value.location, 'Preferred location is required'],
      ['payload.monthlyBudget', value.payload?.monthlyBudget, 'Monthly budget is required'],
      ['payload.moveInPriority', value.payload?.moveInPriority, 'Move-in priority is required'],
    ];

    for (const [, fieldValue, message] of required) {
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        return helpers.error('any.custom', { message });
      }
    }

    const normalizedPayload = applyAccommodationRequirementRules({ ...value.payload }, helpers, false);
    if (normalizedPayload instanceof Error) return normalizedPayload;
    value.payload = normalizedPayload;
    return value;
  })
  .messages({ 'any.custom': '{{#message}}' });

// ── Buy Property ──
const buyPropertyPayloadSchema = Joi.object({
  propertyType: Joi.string().valid(...BUY_PROPERTY_TYPES),
  intendedUse: amenitiesArray(INTENDED_USES),
  budgetRange: Joi.string().valid(...BUY_BUDGET_RANGES),
  bhkRequirement: Joi.string().valid(...BUY_BHK_REQUIREMENTS).allow(null),
  propertySize: propertySizeSchema,
  propertyStatusPreference: Joi.string().valid(...PROPERTY_STATUS_PREFERENCES).allow(null),
  amenitiesPreferred: amenitiesArray(BUY_AMENITIES),
  priority: Joi.string().valid(...BUY_PRIORITY_TIMELINES),
});

const submitBuyPropertySchema = baseInquirySchema
  .keys({ payload: buyPropertyPayloadSchema.default({}) })
  .custom((value, helpers) => {
    if (value.saveAsDraft) {
      if (!value.contact?.fullName || !value.contact?.mobile) {
        return helpers.error('any.custom', { message: 'Full name and mobile are required to save a draft' });
      }
      return value;
    }

    const checks = [
      [value.contact?.fullName, 'Full name is required'],
      [value.contact?.mobile, 'Mobile number is required'],
      [value.location, 'Preferred location is required'],
      [value.payload?.propertyType, 'Property type is required'],
      [value.payload?.budgetRange, 'Budget range is required'],
      [value.payload?.priority, 'Priority timeline is required'],
    ];

    for (const [fieldValue, message] of checks) {
      if (!fieldValue) return helpers.error('any.custom', { message });
    }
    return value;
  })
  .messages({ 'any.custom': '{{#message}}' });

// ── Sell Property ──
const sellPropertyPayloadSchema = Joi.object({
  propertyType: Joi.string().valid(...SELL_PROPERTY_TYPES),
  suitableFor: amenitiesArray(PROPERTY_SUITABLE_FOR),
  propertySize: propertySizeSchema,
  bhk: Joi.string().valid(...SELL_BHK_OPTIONS).allow(null),
  floorNumber: Joi.string().trim().max(20).allow('', null),
  totalFloors: Joi.string().trim().max(20).allow('', null),
  parkingAvailable: Joi.string().valid(...YES_NO).allow(null),
  facing: Joi.string().valid(...FACING_DIRECTIONS).allow(null),
  expectedSellingPrice: Joi.number().positive().allow(null),
  propertyCondition: Joi.string().valid(...SELL_PROPERTY_CONDITIONS).allow(null),
  ownershipType: Joi.string().valid(...OWNERSHIP_TYPES).allow(null),
  legalDocumentType: Joi.string().valid(...LEGAL_DOCUMENT_TYPES),
  titleStatus: Joi.string().valid(...TITLE_STATUSES).allow(null),
  additionalDocuments: amenitiesArray(ADDITIONAL_DOCUMENTS),
  documentStatus: Joi.string().valid(...DOCUMENT_STATUSES).allow(null),
  priority: Joi.string().valid(...SELL_PRIORITY_TIMELINES),
});

const submitSellPropertySchema = baseInquirySchema
  .keys({ payload: sellPropertyPayloadSchema.default({}) })
  .custom((value, helpers) => {
    if (value.saveAsDraft) {
      if (!value.contact?.fullName || !value.contact?.mobile) {
        return helpers.error('any.custom', { message: 'Full name and mobile are required to save a draft' });
      }
      return value;
    }

    const checks = [
      [value.contact?.fullName, 'Full name is required'],
      [value.contact?.mobile, 'Mobile number is required'],
      [value.location?.city, 'Property city is required'],
      [value.location?.area, 'Property area / address is required'],
      [value.payload?.propertyType, 'Property type is required'],
      [value.payload?.propertySize?.value, 'Property size is required'],
      [value.payload?.expectedSellingPrice, 'Expected selling price is required'],
      [value.payload?.legalDocumentType, 'Legal document type is required'],
      [value.payload?.priority, 'Sale timeline is required'],
    ];

    for (const [fieldValue, message] of checks) {
      if (!fieldValue) return helpers.error('any.custom', { message });
    }
    return value;
  })
  .messages({ 'any.custom': '{{#message}}' });

// ── Accommodation Listing ──
const accommodationListingPayloadSchema = Joi.object({
  listingType: Joi.string().valid(...LISTING_TYPES),
  propertyName: Joi.string().trim().max(200).allow('', null),
  propertyType: Joi.string().valid(...LISTING_PROPERTY_TYPES).allow(null),
  suitableFor: amenitiesArray(OCCUPANT_SUITABILITY),
  businessUse: amenitiesArray(BUSINESS_USE_TYPES),
  propertySize: propertySizeSchema,
  bhk: Joi.string().valid(...LISTING_BHK_OPTIONS).allow(null),
  floorNumber: Joi.string().trim().max(20).allow('', null),
  totalFloors: Joi.string().trim().max(20).allow('', null),
  totalBeds: Joi.number().integer().min(0).allow(null),
  availableBeds: Joi.number().integer().min(0).allow(null),
  expectedMonthlyRent: Joi.number().positive().allow(null),
  securityDeposit: Joi.number().min(0).allow(null),
  maintenanceCharges: Joi.number().min(0).allow(null),
  rentPerBed: Joi.number().min(0).allow(null),
  occupancyRules: Joi.object().unknown(true).default({}),
  furnishingStatus: Joi.string().valid('Fully Furnished', 'Semi-Furnished', 'Unfurnished').allow(null),
  amenitiesAvailable: amenitiesArray(LISTING_AMENITIES),
  ownershipType: Joi.string().valid(...OWNERSHIP_TYPES).allow(null),
  legalDocumentType: Joi.string().valid(...LEGAL_DOCUMENT_TYPES),
  titleStatus: Joi.string().valid(...TITLE_STATUSES).allow(null),
  additionalDocuments: amenitiesArray(ADDITIONAL_DOCUMENTS),
  documentStatus: Joi.string().valid(...DOCUMENT_STATUSES).allow(null),
  availableFrom: Joi.string().valid(...AVAILABLE_FROM_OPTIONS).allow(null),
  availableFromDate: Joi.date().iso().allow(null),
  listingUrgency: Joi.string().valid(...LISTING_URGENCY_OPTIONS),
});

const submitAccommodationListingSchema = baseInquirySchema
  .keys({ payload: accommodationListingPayloadSchema.default({}) })
  .custom((value, helpers) => {
    if (value.saveAsDraft) {
      if (!value.contact?.fullName || !value.contact?.mobile) {
        return helpers.error('any.custom', { message: 'Full name and mobile are required to save a draft' });
      }
      return value;
    }

    const checks = [
      [value.contact?.fullName, 'Full name is required'],
      [value.contact?.mobile, 'Mobile number is required'],
      [value.location?.city, 'Property city is required'],
      [value.location?.area, 'Property area / address is required'],
      [value.payload?.listingType, 'Listing type is required'],
      [value.payload?.expectedMonthlyRent, 'Expected monthly rent is required'],
      [value.payload?.legalDocumentType, 'Legal document type is required'],
      [value.payload?.availableFrom, 'Available from is required'],
      [value.payload?.listingUrgency, 'Listing urgency is required'],
    ];

    for (const [fieldValue, message] of checks) {
      if (!fieldValue) return helpers.error('any.custom', { message });
    }
    return value;
  })
  .messages({ 'any.custom': '{{#message}}' });

const FORM_TYPE_VALIDATORS = Object.freeze({
  accommodation_requirement: submitAccommodationRequirementSchema,
  buy_property: submitBuyPropertySchema,
  sell_property: submitSellPropertySchema,
  accommodation_listing: submitAccommodationListingSchema,
});

const formTypeParamSchema = Joi.object({
  formType: Joi.string()
    .valid('accommodation_requirement', 'buy_property', 'sell_property', 'accommodation_listing')
    .required(),
});

module.exports = {
  FORM_TYPE_VALIDATORS,
  formTypeParamSchema,
  submitAccommodationRequirementSchema,
  submitBuyPropertySchema,
  submitSellPropertySchema,
  submitAccommodationListingSchema,
};
