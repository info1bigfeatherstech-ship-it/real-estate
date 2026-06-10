const path = require('path');
const Property = require('../../models/Property.model');
const AppError = require('../../errors/AppError');
const env = require('../../config/env');
const { processImageToWebp } = require('../media/imageProcessor.service');
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

const clearMainImageFlag = (property) => {
  property.media.forEach((item) => {
    item.isMain = false;
  });
};

const assertMediaCapacity = (property) => {
  if (property.media.length >= env.media.maxPropertyMedia) {
    throw AppError.badRequest(
      `Maximum ${env.media.maxPropertyMedia} images allowed per property. Delete existing images before uploading new ones.`
    );
  }
};

const uploadProcessedImage = async ({ propertyId, file, type, isMain, userId }) => {
  const property = await getPropertyOrThrow(propertyId);
  assertMediaCapacity(property);

  const processed = await processImageToWebp(file.buffer);
  const storageKey = buildStorageKey({
    propertyId,
    assetType: 'media',
    fileName: file.originalname,
    extension: '.webp',
  });

  const uploaded = await storageService.uploadImage({
    buffer: processed.buffer,
    storageKey,
    contentType: processed.mimeType,
  });

  if (isMain) clearMainImageFlag(property);

  property.media.push({
    type,
    url: uploaded.url,
    fileName: path.basename(storageKey),
    originalFileName: file.originalname,
    fileSize: processed.fileSize,
    mimeType: processed.mimeType,
    storageKey: uploaded.storageKey,
    storageProvider: uploaded.storageProvider,
    isMain: Boolean(isMain),
  });

  property.lastUpdatedBy = userId;
  await property.save();

  return reloadProperty(propertyId);
};

const addMedia = async (propertyId, { type, isMain }, file, userId) =>
  uploadProcessedImage({ propertyId, file, type, isMain, userId });

const replaceMedia = async (propertyId, mediaId, { type, isMain }, file, userId) => {
  const property = await getPropertyOrThrow(propertyId);
  const media = property.media.id(mediaId);
  if (!media) throw AppError.notFound('Media not found');

  const processed = await processImageToWebp(file.buffer);
  const storageKey = buildStorageKey({
    propertyId,
    assetType: 'media',
    fileName: file.originalname,
    extension: '.webp',
  });

  const uploaded = await storageService.uploadImage({
    buffer: processed.buffer,
    storageKey,
    contentType: processed.mimeType,
  });

  await storageService.deleteAsset(media);

  if (isMain) clearMainImageFlag(property);

  media.type = type || media.type;
  media.url = uploaded.url;
  media.fileName = path.basename(storageKey);
  media.originalFileName = file.originalname;
  media.fileSize = processed.fileSize;
  media.mimeType = processed.mimeType;
  media.storageKey = uploaded.storageKey;
  media.storageProvider = uploaded.storageProvider;
  media.isMain = isMain !== undefined ? Boolean(isMain) : media.isMain;

  property.lastUpdatedBy = userId;
  await property.save();

  return reloadProperty(propertyId);
};

const updateMediaMeta = async (propertyId, mediaId, { type, isMain }, userId) => {
  const property = await getPropertyOrThrow(propertyId);
  const media = property.media.id(mediaId);
  if (!media) throw AppError.notFound('Media not found');

  if (type) media.type = type;

  if (isMain !== undefined) {
    if (isMain) {
      clearMainImageFlag(property);
      media.isMain = true;
    } else {
      media.isMain = false;
    }
  }

  property.lastUpdatedBy = userId;
  await property.save();

  return reloadProperty(propertyId);
};

const removeMedia = async (propertyId, mediaId, userId) => {
  const property = await getPropertyOrThrow(propertyId);
  const media = property.media.id(mediaId);
  if (!media) throw AppError.notFound('Media not found');

  await storageService.deleteAsset(media);
  media.deleteOne();

  property.lastUpdatedBy = userId;
  await property.save();

  return reloadProperty(propertyId);
};

const deleteAllPropertyMedia = async (property) => {
  if (!property.media?.length) return;
  await storageService.deleteAssets([...property.media]);
};

module.exports = {
  addMedia,
  replaceMedia,
  updateMediaMeta,
  removeMedia,
  deleteAllPropertyMedia,
};
