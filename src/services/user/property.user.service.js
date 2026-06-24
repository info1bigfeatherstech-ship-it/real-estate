const Property = require('../../models/Property.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { toPropertyListCard, toPropertyDetail } = require('../../mappers/property.public.mapper');
const {
  buildPublicPropertyFilter,
  buildPublicSort,
  PUBLIC_LIST_PROJECTION,
  PUBLIC_DETAIL_PROJECTION,
} = require('./propertyQuery.builder');

// ✅ FIX: Show all except inactive and draft
const ACTIVE_PUBLIC_FILTER = { status: { $nin: ['inactive', 'draft'] }, isDeleted: false };

const RELATED_PRICE_BAND = 0.25;

const listProperties = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildPublicPropertyFilter(query);
  const sort = buildPublicSort(query.sortBy, query.sortOrder);

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .select(PUBLIC_LIST_PROJECTION)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Property.countDocuments(filter),
  ]);

  return {
    properties: properties.map(toPropertyListCard),
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getPropertyById = async (propertyId) => {
  const property = await Property.findOne({ _id: propertyId, ...ACTIVE_PUBLIC_FILTER })
    .select(PUBLIC_DETAIL_PROJECTION)
    .lean({ virtuals: true });

  if (!property) throw AppError.notFound('Property not found');
  return toPropertyDetail(property);
};

const getPropertyByListingId = async (listingId) => {
  const property = await Property.findOne({ listingId, ...ACTIVE_PUBLIC_FILTER })
    .select(PUBLIC_DETAIL_PROJECTION)
    .lean({ virtuals: true });

  if (!property) throw AppError.notFound('Property not found');
  return toPropertyDetail(property);
};

const getRelatedProperties = async (propertyId, { limit = 6 } = {}) => {
  const source = await Property.findOne({ _id: propertyId, ...ACTIVE_PUBLIC_FILTER })
    .select('listingType propertyType price location.city')
    .lean();

  if (!source) throw AppError.notFound('Property not found');

  const priceDelta = source.price * RELATED_PRICE_BAND;
  const filter = {
    ...ACTIVE_PUBLIC_FILTER,
    _id: { $ne: source._id },
    listingType: source.listingType,
    propertyType: source.propertyType,
    price: {
      $gte: Math.max(0, source.price - priceDelta),
      $lte: source.price + priceDelta,
    },
  };

  if (source.location?.city) {
    filter['location.city'] = new RegExp(
      source.location.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    );
  }

  const properties = await Property.find(filter)
    .select(PUBLIC_LIST_PROJECTION)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean({ virtuals: true });

  return properties.map(toPropertyListCard);
};

module.exports = {
  listProperties,
  getPropertyById,
  getPropertyByListingId,
  getRelatedProperties,
};