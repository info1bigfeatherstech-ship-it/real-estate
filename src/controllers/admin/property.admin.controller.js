const propertyService = require('../../services/admin/property.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

const listProperties = asyncHandler(async (req, res) => {
  const result = await propertyService.listProperties(req.query);
  return ApiResponse.success(res, {
    message: 'Properties fetched successfully',
    data: result.properties,
    meta: result.meta,
  });
});

const getProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id);
  return ApiResponse.success(res, { message: 'Property fetched successfully', data: property });
});

const createProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.createProperty(req.body, req.user._id);
  return ApiResponse.created(res, 'Property created successfully', property);
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.updateProperty(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Property updated successfully', data: property });
});

const updatePropertyStatus = asyncHandler(async (req, res) => {
  const property = await propertyService.updatePropertyStatus(req.params.id, req.body.status, req.user._id);
  return ApiResponse.success(res, { message: 'Property status updated successfully', data: property });
});

const deleteProperty = asyncHandler(async (req, res) => {
  await propertyService.deleteProperty(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: 'Property deleted successfully' });
});

const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');
  const property = await propertyService.addMedia(req.params.id, req.body, req.file, req.user._id);
  return ApiResponse.success(res, { message: 'Media uploaded successfully', data: property });
});

const replaceMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');
  const property = await propertyService.replaceMedia(
    req.params.id,
    req.params.mediaId,
    req.body,
    req.file,
    req.user._id
  );
  return ApiResponse.success(res, { message: 'Media replaced successfully', data: property });
});

const updateMediaMeta = asyncHandler(async (req, res) => {
  const property = await propertyService.updateMediaMeta(
    req.params.id,
    req.params.mediaId,
    req.body,
    req.user._id
  );
  return ApiResponse.success(res, { message: 'Media updated successfully', data: property });
});

const deleteMedia = asyncHandler(async (req, res) => {
  const property = await propertyService.removeMedia(req.params.id, req.params.mediaId, req.user._id);
  return ApiResponse.success(res, { message: 'Media deleted successfully', data: property });
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');
  const property = await propertyService.addDocument(req.params.id, req.body, req.file, req.user._id);
  return ApiResponse.success(res, { message: 'Document uploaded successfully', data: property });
});

const replaceDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');
  const property = await propertyService.replaceDocument(
    req.params.id,
    req.params.documentId,
    req.body,
    req.file,
    req.user._id
  );
  return ApiResponse.success(res, { message: 'Document replaced successfully', data: property });
});

const updateDocumentMeta = asyncHandler(async (req, res) => {
  const property = await propertyService.updateDocumentMeta(
    req.params.id,
    req.params.documentId,
    req.body,
    req.user._id
  );
  return ApiResponse.success(res, { message: 'Document updated successfully', data: property });
});

const deleteDocument = asyncHandler(async (req, res) => {
  const property = await propertyService.removeDocument(req.params.id, req.params.documentId, req.user._id);
  return ApiResponse.success(res, { message: 'Document deleted successfully', data: property });
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
