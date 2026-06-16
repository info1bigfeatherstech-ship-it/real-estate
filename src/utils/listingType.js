const normalizeListingType = (listingType) =>
  listingType === 'For Sale' ? 'For Sell' : listingType;

const normalizeListingTypeFilter = (listingType) => {
  if (!listingType) return null;
  const normalized = normalizeListingType(listingType);
  if (normalized === 'For Sell') {
    return { $in: ['For Sell', 'For Sale'] };
  }
  return normalized;
};

const LEGACY_LISTING_TYPE = 'For Sale';

/** Joi field: accepts legacy "For Sale" and normalizes to "For Sell". */
const listingTypeJoi = (listingTypes, { required = false } = {}) => {
  const Joi = require('joi');
  let schema = Joi.string()
    .valid(...listingTypes, LEGACY_LISTING_TYPE)
    .custom((value) => normalizeListingType(value));
  if (required) schema = schema.required();
  return schema;
};

module.exports = {
  normalizeListingType,
  normalizeListingTypeFilter,
  LEGACY_LISTING_TYPE,
  listingTypeJoi,
};
