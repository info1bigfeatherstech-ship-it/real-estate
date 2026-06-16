const Property = require('../../models/Property.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { normalizeListingTypeFilter } = require('../../utils/listingType');
const propertyMediaService = require('./propertyMedia.service');
const propertyDocumentService = require('./propertyDocument.service');

const populateFields = [
  { path: 'createdBy', select: 'name email role' },
  { path: 'lastUpdatedBy', select: 'name email role' },
];

const buildListFilter = ({ search, listingType, propertyType, status, city }) => {
  const filter = { isDeleted: false };

  const listingTypeFilter = normalizeListingTypeFilter(listingType);
  if (listingTypeFilter) filter.listingType = listingTypeFilter;
  if (propertyType) filter.propertyType = propertyType;
  if (status) filter.status = status;
  if (city) filter['location.city'] = new RegExp(city, 'i');

  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { listingId: new RegExp(search, 'i') },
      { 'location.city': new RegExp(search, 'i') },
      { 'location.fullAddress': new RegExp(search, 'i') },
    ];
  }

  return filter;
};

const listProperties = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(query);
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateFields)
      .lean({ virtuals: true }),
    Property.countDocuments(filter),
  ]);

  return {
    properties,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getPropertyById = async (propertyId) => {
  const property = await Property.findOne({ _id: propertyId, isDeleted: false }).populate(populateFields);

  if (!property) throw AppError.notFound('Property not found');
  return property;
};

const createProperty = async (data, userId) => {
  const property = await Property.create({
    ...data,
    createdBy: userId,
    lastUpdatedBy: userId,
  });

  return Property.findById(property._id).populate(populateFields);
};

const updateProperty = async (propertyId, data, userId) => {
  const property = await Property.findOneAndUpdate(
    { _id: propertyId, isDeleted: false },
    { ...data, lastUpdatedBy: userId },
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!property) throw AppError.notFound('Property not found');
  return property;
};

const updatePropertyStatus = async (propertyId, status, userId) => {
  const update = { status, lastUpdatedBy: userId };
  if (status === 'active') {
    update.publishedAt = new Date();
  }

  const property = await Property.findOneAndUpdate(
    { _id: propertyId, isDeleted: false },
    update,
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!property) throw AppError.notFound('Property not found');
  return property;
};

const deleteProperty = async (propertyId, userId) => {
  const property = await Property.findOne({ _id: propertyId, isDeleted: false });
  if (!property) throw AppError.notFound('Property not found');

  await propertyMediaService.deleteAllPropertyMedia(property);
  await propertyDocumentService.deleteAllPropertyDocuments(property);

  property.media = [];
  property.documents = [];
  property.isDeleted = true;
  property.deletedAt = new Date();
  property.status = 'inactive';
  property.lastUpdatedBy = userId;

  await property.save();
  return property;
};

module.exports = {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
  addMedia: propertyMediaService.addMedia,
  replaceMedia: propertyMediaService.replaceMedia,
  updateMediaMeta: propertyMediaService.updateMediaMeta,
  removeMedia: propertyMediaService.removeMedia,
  addDocument: propertyDocumentService.addDocument,
  replaceDocument: propertyDocumentService.replaceDocument,
  updateDocumentMeta: propertyDocumentService.updateDocumentMeta,
  removeDocument: propertyDocumentService.removeDocument,
};
