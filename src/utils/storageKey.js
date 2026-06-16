const crypto = require('crypto');
const path = require('path');

const sanitizeFileStem = (fileName) => {
  const stem = path.parse(String(fileName || 'file')).name;
  return stem.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60) || 'file';
};

const buildStorageKey = ({ propertyId, assetType, fileName, extension }) => {
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const safeStem = sanitizeFileStem(fileName);
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return `properties/${propertyId}/${assetType}/${safeStem}-${uniqueId}${ext}`;
};

const buildInquiryStorageKey = ({ inquiryId, assetType, fileName, extension }) => {
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const safeStem = sanitizeFileStem(fileName);
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return `inquiries/${inquiryId}/${assetType}/${safeStem}-${uniqueId}${ext}`;
};

const buildLocalPublicUrl = (storageKey) => {
  const env = require('../config/env');
  const base = env.publicApiBaseUrl || `http://localhost:${env.port}`;
  return `${base}/uploads/${storageKey}`;
};

module.exports = { buildStorageKey, buildInquiryStorageKey, buildLocalPublicUrl, sanitizeFileStem };
