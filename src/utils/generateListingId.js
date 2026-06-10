const crypto = require('crypto');

const generateListingId = () => {
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const numeric = Math.floor(10000 + Math.random() * 90000);
  return `EA-${numeric}-${suffix}`;
};

module.exports = { generateListingId };
