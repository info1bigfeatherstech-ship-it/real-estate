const propertyOwnerService = require('../../services/customer/property.owner.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── List Properties ──────────────────────────────────────────────────────
const listProperties = asyncHandler(async (req, res) => {
  const result = await propertyOwnerService.listProperties(req.customer._id, req.query);
  return ApiResponse.success(res, {
    message: 'Properties fetched successfully',
    data: result.properties,
    meta: result.meta,
  });
});

// ─── Get Single Property ──────────────────────────────────────────────────
const getProperty = asyncHandler(async (req, res) => {
  const property = await propertyOwnerService.getPropertyById(req.customer._id, req.params.id);
  return ApiResponse.success(res, {
    message: 'Property fetched successfully',
    data: property,
  });
});

// ─── Create Property ──────────────────────────────────────────────────────
const createProperty = asyncHandler(async (req, res) => {
  if (!['owner', 'agent'].includes(req.customer.accountType)) {
    throw AppError.forbidden('Only property owners and agents can list properties');
  }

  const property = await propertyOwnerService.createProperty(req.customer._id, req.body);
  return ApiResponse.created(res, 'Property submitted for admin approval', property);
});

// ─── Update Property ──────────────────────────────────────────────────────
const updateProperty = asyncHandler(async (req, res) => {
  const property = await propertyOwnerService.updateProperty(
    req.customer._id,
    req.params.id,
    req.body
  );
  return ApiResponse.success(res, {
    message: 'Property updated successfully',
    data: property,
  });
});

// ─── Update Property Status ──────────────────────────────────────────────
const updatePropertyStatus = asyncHandler(async (req, res) => {
  const property = await propertyOwnerService.updatePropertyStatus(
    req.customer._id,
    req.params.id,
    req.body.status
  );
  return ApiResponse.success(res, {
    message: 'Property status updated successfully',
    data: property,
  });
});

// ─── Delete Property ──────────────────────────────────────────────────────
const deleteProperty = asyncHandler(async (req, res) => {
  await propertyOwnerService.deleteProperty(req.customer._id, req.params.id);
  return ApiResponse.success(res, {
    message: 'Property deleted successfully',
  });
});

// ─── ✅ MEDIA ROUTES (NEW) ──────────────────────────────────────────────

// Upload Media
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');
  const property = await propertyOwnerService.addMedia(
    req.params.id,
    req.body,
    req.file,
    req.customer._id
  );
  return ApiResponse.success(res, {
    message: 'Media uploaded successfully',
    data: property,
  });
});

// Replace Media
const replaceMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');
  const property = await propertyOwnerService.replaceMedia(
    req.params.id,
    req.params.mediaId,
    req.body,
    req.file,
    req.customer._id
  );
  return ApiResponse.success(res, {
    message: 'Media replaced successfully',
    data: property,
  });
});

// Update Media Meta (set main image, etc.)
const updateMediaMeta = asyncHandler(async (req, res) => {
  const property = await propertyOwnerService.updateMediaMeta(
    req.params.id,
    req.params.mediaId,
    req.body,
    req.customer._id
  );
  return ApiResponse.success(res, {
    message: 'Media metadata updated successfully',
    data: property,
  });
});

// Delete Media
const deleteMedia = asyncHandler(async (req, res) => {
  const property = await propertyOwnerService.removeMedia(
    req.params.id,
    req.params.mediaId,
    req.customer._id
  );
  return ApiResponse.success(res, {
    message: 'Media deleted successfully',
    data: property,
  });
});

// ─── ✅ DOCUMENT ROUTES (NEW) ────────────────────────────────────────────

// Upload Document
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');
  const property = await propertyOwnerService.addDocument(
    req.params.id,
    req.body,
    req.file,
    req.customer._id
  );
  return ApiResponse.success(res, {
    message: 'Document uploaded successfully',
    data: property,
  });
});

// Replace Document
const replaceDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');
  const property = await propertyOwnerService.replaceDocument(
    req.params.id,
    req.params.documentId,
    req.body,
    req.file,
    req.customer._id
  );
  return ApiResponse.success(res, {
    message: 'Document replaced successfully',
    data: property,
  });
});

// Update Document Metadata
const updateDocumentMeta = asyncHandler(async (req, res) => {
  const property = await propertyOwnerService.updateDocumentMeta(
    req.params.id,
    req.params.documentId,
    req.body,
    req.customer._id
  );
  return ApiResponse.success(res, {
    message: 'Document metadata updated successfully',
    data: property,
  });
});

// Delete Document
const deleteDocument = asyncHandler(async (req, res) => {
  const property = await propertyOwnerService.removeDocument(
    req.params.id,
    req.params.documentId,
    req.customer._id
  );
  return ApiResponse.success(res, {
    message: 'Document deleted successfully',
    data: property,
  });
});

module.exports = {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
  uploadMedia,
  replaceMedia,
  updateMediaMeta,
  deleteMedia,
  uploadDocument,
  replaceDocument,
  updateDocumentMeta,
  deleteDocument,
};