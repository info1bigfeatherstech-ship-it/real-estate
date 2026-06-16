const normalizeListingType = (listingType) =>
  listingType === 'For Sale' ? 'For Sell' : listingType;

const normalizeListingTypeFilter = (listingType) => {
  if (!listingType) return null;
  if (listingType === 'For Sell') {
    return { $in: ['For Sell', 'For Sale'] };
  }
  return listingType;
};

module.exports = {
  normalizeListingType,
  normalizeListingTypeFilter,
};
