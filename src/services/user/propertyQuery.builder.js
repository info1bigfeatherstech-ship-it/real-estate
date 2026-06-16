const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const { normalizeListingTypeFilter } = require('../../utils/listingType');

const applyExactOrRange = (filter, field, exact, min, max) => {
  if (exact !== undefined && exact !== null) {
    filter[field] = exact;
    return;
  }
  if (min === undefined && max === undefined) return;

  filter[field] = {};
  if (min !== undefined) filter[field].$gte = min;
  if (max !== undefined) filter[field].$lte = max;
};

const applyArrayFilter = (filter, field, values, mode) => {
  if (!values?.length) return;
  filter[field] = mode === 'all' ? { $all: values } : { $in: values };
};

const buildPublicPropertyFilter = (query) => {
  const filter = {
    status: 'active',
    isDeleted: false,
  };

  const listingTypeFilter = normalizeListingTypeFilter(query.listingType);
  if (listingTypeFilter) filter.listingType = listingTypeFilter;
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.state) filter['location.state'] = query.state;
  if (query.pincode) filter['location.pincode'] = query.pincode;
  if (query.city) filter['location.city'] = new RegExp(escapeRegex(query.city), 'i');

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { title: pattern },
      { listingId: pattern },
      { 'location.city': pattern },
      { 'location.fullAddress': pattern },
    ];
  }

  applyExactOrRange(filter, 'price', undefined, query.minPrice, query.maxPrice);
  applyExactOrRange(filter, 'area.value', undefined, query.minArea, query.maxArea);
  applyExactOrRange(filter, 'maintenance', undefined, query.minMaintenance, query.maxMaintenance);
  applyExactOrRange(filter, 'bedrooms', query.bedrooms, query.minBedrooms, query.maxBedrooms);
  applyExactOrRange(filter, 'bathrooms', query.bathrooms, query.minBathrooms, query.maxBathrooms);
  applyExactOrRange(filter, 'floorNo', query.floorNo, query.minFloorNo, query.maxFloorNo);
  if (query.totalFloors !== undefined) filter.totalFloors = query.totalFloors;

  if (query.ownershipType) filter.ownershipType = query.ownershipType;
  if (query.condition) filter.condition = query.condition;
  if (query.constructionStatus) filter.constructionStatus = query.constructionStatus;
  if (query.furnishing) filter.furnishing = query.furnishing;
  if (query.facing) filter.facing = query.facing;
  if (query.flooringType) filter.flooringType = query.flooringType;
  if (query.waterSupply) filter.waterSupply = query.waterSupply;
  if (query.powerBackup) filter.powerBackup = query.powerBackup;
  if (query.parkingType) filter.parkingType = query.parkingType;

  applyArrayFilter(filter, 'amenities', query.amenities, query.amenitiesMode);
  applyArrayFilter(filter, 'securityFeatures', query.securityFeatures, query.securityFeaturesMode);
  applyArrayFilter(filter, 'connectivity', query.connectivity, query.connectivityMode);
  applyArrayFilter(filter, 'nearbyFacilities', query.nearbyFacilities, query.nearbyFacilitiesMode);

  if (query.tenantTypeAllowed?.length) {
    filter['rentalDetails.tenantTypeAllowed'] = { $in: query.tenantTypeAllowed };
  }
  if (query.availability) filter['rentalDetails.availability'] = query.availability;
  if (query.foodPreference) filter['rentalDetails.foodPreference'] = query.foodPreference;
  if (query.pets) filter['rentalDetails.pets'] = query.pets;
  if (query.smoking) filter['rentalDetails.smoking'] = query.smoking;
  if (query.alcohol) filter['rentalDetails.alcohol'] = query.alcohol;
  if (query.guestPolicy) filter['rentalDetails.guestPolicy'] = query.guestPolicy;
  if (query.preferredMoveInDate) filter['rentalDetails.preferredMoveInDate'] = query.preferredMoveInDate;
  if (query.securityDeposit) filter['rentalDetails.securityDeposit'] = query.securityDeposit;
  if (query.governmentEmployeePreferred !== undefined) {
    filter['rentalDetails.governmentEmployeePreferred'] = query.governmentEmployeePreferred;
  }

  if (query.possessionStatus) filter['saleDetails.possessionStatus'] = query.possessionStatus;
  if (query.loanAvailability) filter['saleDetails.loanAvailability'] = query.loanAvailability;

  return filter;
};

const buildPublicSort = (sortBy, sortOrder) => {
  const direction = sortOrder === 'asc' ? 1 : -1;
  const sortFieldMap = {
    publishedAt: 'publishedAt',
    price: 'price',
    createdAt: 'createdAt',
    title: 'title',
    'area.value': 'area.value',
  };
  return { [sortFieldMap[sortBy]]: direction };
};

const PUBLIC_LIST_PROJECTION = {
  documents: 0,
  createdBy: 0,
  lastUpdatedBy: 0,
  deletedAt: 0,
  isDeleted: 0,
  status: 0,
};

const PUBLIC_DETAIL_PROJECTION = {
  documents: 0,
  createdBy: 0,
  lastUpdatedBy: 0,
  deletedAt: 0,
  isDeleted: 0,
  status: 0,
};

module.exports = {
  buildPublicPropertyFilter,
  buildPublicSort,
  PUBLIC_LIST_PROJECTION,
  PUBLIC_DETAIL_PROJECTION,
};
