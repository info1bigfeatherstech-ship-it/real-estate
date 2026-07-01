const userRoles = require('./userRoles');
const propertyEnums = require('./propertyEnums');
const eliteServiceEnums = require('./eliteServiceEnums');
const accommodationInquiryEnums = require('./accommodationInquiryEnums');
const indianStateCodes = require('./indianStateCodes');
const tenantEnums = require('./tenantEnums');
const inquiryEnums = require('./inquiryEnums');


module.exports = {
  ...userRoles,
  ...propertyEnums,
  ...eliteServiceEnums,
  ...accommodationInquiryEnums,
  ...indianStateCodes,
  ...tenantEnums,
  ...inquiryEnums,

  // ── Restore: property enums jo inquiryEnums ne overwrite kar diye ──
  LISTING_TYPES: propertyEnums.LISTING_TYPES,
  OWNERSHIP_TYPES: propertyEnums.OWNERSHIP_TYPES,
  LEGAL_DOCUMENT_TYPES: propertyEnums.LEGAL_DOCUMENT_TYPES,
  FACING_DIRECTIONS: propertyEnums.FACING_DIRECTIONS,

  // ── Inquiry-specific enums with unique names (no clash) ──
  INQUIRY_LISTING_TYPES: inquiryEnums.LISTING_TYPES,
  INQUIRY_OWNERSHIP_TYPES: inquiryEnums.OWNERSHIP_TYPES,
  INQUIRY_LEGAL_DOCUMENT_TYPES: inquiryEnums.LEGAL_DOCUMENT_TYPES,
  INQUIRY_FACING_DIRECTIONS: inquiryEnums.FACING_DIRECTIONS,
};
