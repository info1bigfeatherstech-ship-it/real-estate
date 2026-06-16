const { normalizeListingType } = require('../utils/listingType');

const toPublicMedia = (media = []) =>
  media.map((item) => ({
    _id: item._id,
    type: item.type,
    url: item.url,
    isMain: item.isMain,
    mimeType: item.mimeType,
  }));

const resolveMainImage = (property) => {
  if (property.mainImage) return property.mainImage;
  const media = property.media || [];
  const main = media.find((m) => m.isMain);
  return main?.url || media[0]?.url || null;
};

const toListLocation = (location = {}) => ({
  city: location.city || '',
  state: location.state || null,
  pincode: location.pincode || null,
});

const toDetailLocation = (location = {}) => ({
  fullAddress: location.fullAddress || '',
  city: location.city || '',
  state: location.state || null,
  pincode: location.pincode || null,
  latitude: location.latitude ?? null,
  longitude: location.longitude ?? null,
});

const toPropertyListCard = (property) => ({
  _id: property._id,
  listingId: property.listingId,
  listingType: normalizeListingType(property.listingType),
  propertyType: property.propertyType,
  title: property.title,
  price: property.price,
  maintenance: property.maintenance ?? null,
  bedrooms: property.bedrooms ?? null,
  bathrooms: property.bathrooms ?? null,
  area: property.area ?? { value: null, unit: 'sqft' },
  furnishing: property.furnishing ?? null,
  location: toListLocation(property.location),
  media: toPublicMedia(property.media),
  mainImage: resolveMainImage(property),
  publishedAt: property.publishedAt ?? null,
});

const toPropertyDetail = (property) => ({
  _id: property._id,
  listingId: property.listingId,
  listingType: normalizeListingType(property.listingType),
  propertyType: property.propertyType,
  title: property.title,
  description: property.description || '',
  ownershipType: property.ownershipType ?? null,
  condition: property.condition ?? null,
  constructionStatus: property.constructionStatus ?? null,
  furnishing: property.furnishing ?? null,
  facing: property.facing ?? null,
  flooringType: property.flooringType ?? null,
  area: property.area ?? { value: null, unit: 'sqft' },
  price: property.price,
  maintenance: property.maintenance ?? null,
  bedrooms: property.bedrooms ?? null,
  bathrooms: property.bathrooms ?? null,
  floorNo: property.floorNo ?? null,
  totalFloors: property.totalFloors ?? null,
  waterSupply: property.waterSupply ?? null,
  powerBackup: property.powerBackup ?? null,
  parkingType: property.parkingType ?? null,
  securityFeatures: property.securityFeatures || [],
  amenities: property.amenities || [],
  connectivity: property.connectivity || [],
  nearbyFacilities: property.nearbyFacilities || [],
  rentalDetails: property.rentalDetails ?? null,
  saleDetails: property.saleDetails ?? null,
  location: toDetailLocation(property.location),
  media: toPublicMedia(property.media),
  mainImage: resolveMainImage(property),
  publishedAt: property.publishedAt ?? null,
  createdAt: property.createdAt,
  updatedAt: property.updatedAt,
});

module.exports = {
  toPropertyListCard,
  toPropertyDetail,
  toPublicMedia,
};
