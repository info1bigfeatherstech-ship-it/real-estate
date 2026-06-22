const Property = require('../../models/Property.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { normalizeListingTypeFilter } = require('../../utils/listingType');
const propertyMediaService = require('./propertyMedia.service');
const propertyDocumentService = require('./propertyDocument.service');

// ✅ FIX: Populate fields — Mongoose refPath automatically handles User/Customer
const populateFields = [
  { path: 'createdBy', select: 'name email role fullName accountType' },
  { path: 'lastUpdatedBy', select: 'name email role fullName accountType' },
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

// ─── Create Property (Admin) ──────────────────────────────────────────────
const createProperty = async (data, userId) => {
  const property = await Property.create({
    ...data,
    createdBy: userId,
    createdByModel: 'User',   // ← ✅ ADD THIS
    lastUpdatedBy: userId,
    updatedByModel: 'User',   // ← ✅ ADD THIS
  });

  return Property.findById(property._id).populate(populateFields);
};

// ─── Update Property (Admin) ──────────────────────────────────────────────
const updateProperty = async (propertyId, data, userId) => {
  const property = await Property.findOneAndUpdate(
    { _id: propertyId, isDeleted: false },
    { 
      ...data, 
      lastUpdatedBy: userId,
      updatedByModel: 'User',   // ← ✅ ADD THIS
    },
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!property) throw AppError.notFound('Property not found');
  return property;
};

// ─── Update Property Status (Admin) ──────────────────────────────────────
const updatePropertyStatus = async (propertyId, status, userId) => {
  const update = { 
    status, 
    lastUpdatedBy: userId,
    updatedByModel: 'User',   // ← ✅ ADD THIS
  };
  
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

// ─── Approve Property ──────────────────────────────────────────────────────
const approveProperty = async (propertyId, userId) => {
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    status: 'pending',
  });

  if (!property) {
    throw AppError.notFound('Pending property not found or already processed');
  }

  property.status = 'active';
  property.publishedAt = new Date();
  property.lastUpdatedBy = userId;
  property.updatedByModel = 'User';   // ← ✅ ADD THIS
  await property.save();

  return property.populate(populateFields);
};

// ─── Reject Property ──────────────────────────────────────────────────────
const rejectProperty = async (propertyId, userId, reason = null) => {
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
    status: 'pending',
  });

  if (!property) {
    throw AppError.notFound('Pending property not found or already processed');
  }

  property.status = 'rejected';
  property.lastUpdatedBy = userId;
  property.updatedByModel = 'User';   // ← ✅ ADD THIS
  
  // Optional: Store rejection reason (you'll need to add this field to model)
  if (reason) {
    property.rejectionReason = reason;
  }
  
  await property.save();

  return property.populate(populateFields);
};

// ─── Delete Property (Admin) ──────────────────────────────────────────────
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
  property.updatedByModel = 'User';   // ← ✅ ADD THIS

  await property.save();
  return property;
};

module.exports = {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  approveProperty,    // ← NEW
  rejectProperty,     // ← NEW
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