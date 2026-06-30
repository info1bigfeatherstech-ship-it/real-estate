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
  // ...inquiryEnums
};
