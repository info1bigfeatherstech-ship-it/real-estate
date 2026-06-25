const Property = require('../../models/Property.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { normalizeListingTypeFilter } = require('../../utils/listingType');
const propertyMediaService = require('../admin/propertyMedia.service');
const propertyDocumentService = require('../admin/propertyDocument.service');

const populateFields = [
  { path: 'createdBy', select: 'name email role fullName accountType' },
  { path: 'lastUpdatedBy', select: 'name email role fullName accountType' },
];

// ─── List Properties ──────────────────────────────────────────────────────
const listProperties = async (customerId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(customerId, query);
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

const buildListFilter = (customerId, { search, listingType, propertyType, status, city }) => {
  const filter = {
    isDeleted: false,
    createdBy: customerId,
  };

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

// ─── Get Single Property ──────────────────────────────────────────────────
const getPropertyById = async (customerId, propertyId) => {
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    createdBy: customerId,
  }).populate(populateFields);

  if (!property) throw AppError.notFound('Property not found');
  return property;
};

// ─── Create Property ──────────────────────────────────────────────────────
const createProperty = async (customerId, data) => {
  const property = await Property.create({
    ...data,
    status: 'pending',
    createdBy: customerId,
    createdByModel: 'Customer',
    lastUpdatedBy: customerId,
    updatedByModel: 'Customer',
  });

  return Property.findById(property._id).populate(populateFields);
};

// ─── Update Property ──────────────────────────────────────────────────────
const updateProperty = async (customerId, propertyId, data) => {
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!property) throw AppError.notFound('Property not found');

  if (property.status === 'active') {
    throw AppError.forbidden('Active properties cannot be modified. Contact admin for changes.');
  }

  const updated = await Property.findOneAndUpdate(
    { _id: propertyId, isDeleted: false, createdBy: customerId },
    {
      ...data,
      lastUpdatedBy: customerId,
      updatedByModel: 'Customer',
    },
    { new: true, runValidators: true }
  ).populate(populateFields);

  return updated;
};

// ─── Update Property Status ──────────────────────────────────────────────
// ─── Update Property Status ──────────────────────────────────────────────
const updatePropertyStatus = async (customerId, propertyId, status) => {
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!property) throw AppError.notFound('Property not found');

  const allowedStatuses = ['draft', 'active', 'inactive', 'rented', 'occupied', 'sold'];
  if (!allowedStatuses.includes(status)) {
    throw AppError.forbidden(`Cannot set status to "${status}". Only admin can approve/reject.`);
  }

  // ✅ Check if this is a deal completion
  const dealStatuses = ['rented', 'occupied', 'sold'];
  const isDealComplete = dealStatuses.includes(status) && property.status !== status;

  if (property.status === 'pending' || property.status === 'rejected') {
    throw AppError.forbidden(`Cannot change status of ${property.status} property. Wait for admin approval.`);
  }

  property.status = status;
  property.lastUpdatedBy = customerId;
  property.updatedByModel = 'Customer';
  await property.save();

  // ✅ Increment agent deal count if deal is complete
  if (isDealComplete) {
    try {
      const agentBadgeService = require('./agentBadge.customer.service');
      await agentBadgeService.incrementDealCount(customerId, {
        propertyId,
        dealType: status === 'sold' ? 'sale' : 'rent',
      });
    } catch (error) {
      console.error('Failed to update agent badge:', error);
      // Don't fail the request, just log
    }
  }

  return property.populate(populateFields);
};

// ─── Delete Property ──────────────────────────────────────────────────────
const deleteProperty = async (customerId, propertyId) => {
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!property) throw AppError.notFound('Property not found');

  await propertyMediaService.deleteAllPropertyMedia(property);
  await propertyDocumentService.deleteAllPropertyDocuments(property);

  property.media = [];
  property.documents = [];
  property.isDeleted = true;
  property.deletedAt = new Date();
  property.status = 'inactive';
  property.lastUpdatedBy = customerId;
  property.updatedByModel = 'Customer';

  await property.save();
  return property;
};

// ─── ✅ MEDIA METHODS (NEW) ──────────────────────────────────────────────
// These directly call the admin media services since the logic is same,
// but they pass customerId as userId for tracking

const addMedia = async (propertyId, body, file, customerId) => {
  return propertyMediaService.addMedia(propertyId, body, file, customerId);
};

const replaceMedia = async (propertyId, mediaId, body, file, customerId) => {
  return propertyMediaService.replaceMedia(propertyId, mediaId, body, file, customerId);
};

const updateMediaMeta = async (propertyId, mediaId, body, customerId) => {
  return propertyMediaService.updateMediaMeta(propertyId, mediaId, body, customerId);
};

const removeMedia = async (propertyId, mediaId, customerId) => {
  return propertyMediaService.removeMedia(propertyId, mediaId, customerId);
};

// ─── ✅ DOCUMENT METHODS (NEW) ────────────────────────────────────────────
const addDocument = async (propertyId, body, file, customerId) => {
  return propertyDocumentService.addDocument(propertyId, body, file, customerId);
};

const replaceDocument = async (propertyId, documentId, body, file, customerId) => {
  return propertyDocumentService.replaceDocument(propertyId, documentId, body, file, customerId);
};

const updateDocumentMeta = async (propertyId, documentId, body, customerId) => {
  return propertyDocumentService.updateDocumentMeta(propertyId, documentId, body, customerId);
};

const removeDocument = async (propertyId, documentId, customerId) => {
  return propertyDocumentService.removeDocument(propertyId, documentId, customerId);
};

module.exports = {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
  addMedia,
  replaceMedia,
  updateMediaMeta,
  removeMedia,
  addDocument,
  replaceDocument,
  updateDocumentMeta,
  removeDocument,
};