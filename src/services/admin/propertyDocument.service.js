const path = require('path');
const Property = require('../../models/Property.model');
const AppError = require('../../errors/AppError');
const env = require('../../config/env');
const storageService = require('../storage/storage.service');
const { buildStorageKey } = require('../../utils/storageKey');

const populateFields = [
  { path: 'createdBy', select: 'name email role' },
  { path: 'lastUpdatedBy', select: 'name email role' },
];

const getPropertyOrThrow = async (propertyId) => {
  const property = await Property.findOne({ _id: propertyId, isDeleted: false });
  if (!property) throw AppError.notFound('Property not found');
  return property;
};

const reloadProperty = (propertyId) =>
  Property.findById(propertyId).populate(populateFields);

const assertDocumentCapacity = (property) => {
  if (property.documents.length >= env.media.maxPropertyDocuments) {
    throw AppError.badRequest(
      `Maximum ${env.media.maxPropertyDocuments} documents allowed per property.`
    );
  }
};

const uploadRawDocument = async ({ propertyId, file, category, type, userId }) => {
  const property = await getPropertyOrThrow(propertyId);
  assertDocumentCapacity(property);

  const extension = path.extname(file.originalname || '').toLowerCase() || '.bin';
  const storageKey = buildStorageKey({
    propertyId,
    assetType: 'documents',
    fileName: file.originalname,
    extension,
  });

  const uploaded = await storageService.uploadDocument({
    buffer: file.buffer,
    storageKey,
    contentType: file.mimetype || 'application/octet-stream',
  });

  property.documents.push({
    category,
    type,
    url: uploaded.url,
    fileName: path.basename(storageKey),
    originalFileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype || uploaded.mimeType,
    storageKey: uploaded.storageKey,
    storageProvider: uploaded.storageProvider,
  });

  property.lastUpdatedBy = userId;
  await property.save();

  return reloadProperty(propertyId);
};

const addDocument = async (propertyId, { category, type }, file, userId) =>
  uploadRawDocument({ propertyId, file, category, type, userId });

const replaceDocument = async (propertyId, documentId, { category, type }, file, userId) => {
  const property = await getPropertyOrThrow(propertyId);
  const doc = property.documents.id(documentId);
  if (!doc) throw AppError.notFound('Document not found');

  const extension = path.extname(file.originalname || '').toLowerCase() || '.bin';
  const storageKey = buildStorageKey({
    propertyId,
    assetType: 'documents',
    fileName: file.originalname,
    extension,
  });

  const uploaded = await storageService.uploadDocument({
    buffer: file.buffer,
    storageKey,
    contentType: file.mimetype || 'application/octet-stream',
  });

  await storageService.deleteAsset(doc);

  doc.category = category || doc.category;
  doc.type = type || doc.type;
  doc.url = uploaded.url;
  doc.fileName = path.basename(storageKey);
  doc.originalFileName = file.originalname;
  doc.fileSize = file.size;
  doc.mimeType = file.mimetype || uploaded.mimeType;
  doc.storageKey = uploaded.storageKey;
  doc.storageProvider = uploaded.storageProvider;

  property.lastUpdatedBy = userId;
  await property.save();

  return reloadProperty(propertyId);
};

const updateDocumentMeta = async (propertyId, documentId, { category, type }, userId) => {
  const property = await getPropertyOrThrow(propertyId);
  const doc = property.documents.id(documentId);
  if (!doc) throw AppError.notFound('Document not found');

  if (category) doc.category = category;
  if (type) doc.type = type;

  property.lastUpdatedBy = userId;
  await property.save();

  return reloadProperty(propertyId);
};

const removeDocument = async (propertyId, documentId, userId) => {
  const property = await getPropertyOrThrow(propertyId);
  const doc = property.documents.id(documentId);
  if (!doc) throw AppError.notFound('Document not found');

  await storageService.deleteAsset(doc);
  doc.deleteOne();

  property.lastUpdatedBy = userId;
  await property.save();

  return reloadProperty(propertyId);
};

const deleteAllPropertyDocuments = async (property) => {
  if (!property.documents?.length) return;
  await storageService.deleteAssets([...property.documents]);
};

module.exports = {
  addDocument,
  replaceDocument,
  updateDocumentMeta,
  removeDocument,
  deleteAllPropertyDocuments,
};
