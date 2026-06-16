const {
  DOCUMENT_CATEGORIES,
  DOCUMENT_TYPES_BY_CATEGORY,
} = require('../constants/propertyEnums');

const getDocumentTypesForCategory = (category) => DOCUMENT_TYPES_BY_CATEGORY[category] || [];

const isValidDocumentTypeForCategory = (category, type) =>
  getDocumentTypesForCategory(category).includes(type);

const assertValidDocumentTypeForCategory = (category, type) => {
  if (!DOCUMENT_CATEGORIES.includes(category)) {
    return `Invalid document category: "${category}"`;
  }
  if (!isValidDocumentTypeForCategory(category, type)) {
    const allowed = getDocumentTypesForCategory(category).join(', ');
    return `Invalid document type "${type}" for category "${category}". Allowed: ${allowed}`;
  }
  return null;
};

module.exports = {
  getDocumentTypesForCategory,
  isValidDocumentTypeForCategory,
  assertValidDocumentTypeForCategory,
};
