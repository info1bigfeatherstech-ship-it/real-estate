const path = require('path');
const AppError = require('../errors/AppError');
const storageService = require('./storage/storage.service');
const { buildInquiryStorageKey } = require('../utils/storageKey');
const {
  MAX_INQUIRY_REFERENCE_IMAGES,
  MAX_INQUIRY_OTHER_FILES,
} = require('../constants/accommodationInquiryEnums');

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const assertAttachmentLimits = (referenceImages = [], otherFiles = []) => {
  if (referenceImages.length > MAX_INQUIRY_REFERENCE_IMAGES) {
    throw AppError.badRequest(`Maximum ${MAX_INQUIRY_REFERENCE_IMAGES} reference images allowed`);
  }
  if (otherFiles.length > MAX_INQUIRY_OTHER_FILES) {
    throw AppError.badRequest(`Maximum ${MAX_INQUIRY_OTHER_FILES} other files allowed`);
  }
};

const uploadAttachment = async ({ inquiryId, file, kind }) => {
  const extension = path.extname(file.originalname || '').toLowerCase() || '.bin';
  const storageKey = buildInquiryStorageKey({
    inquiryId,
    assetType: kind,
    fileName: file.originalname,
    extension,
  });

  const isImage = IMAGE_MIME_TYPES.has(file.mimetype);
  const uploader = isImage ? storageService.uploadImage : storageService.uploadDocument;

  const uploaded = await uploader({
    buffer: file.buffer,
    storageKey,
    contentType: file.mimetype || 'application/octet-stream',
  });

  return {
    kind,
    url: uploaded.url,
    fileName: path.basename(storageKey),
    originalFileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype || uploaded.mimeType,
    storageKey: uploaded.storageKey,
    storageProvider: uploaded.storageProvider,
  };
};

const uploadInquiryAttachments = async (inquiryId, files = {}) => {
  const referenceImages = files.referenceImages || [];
  const otherFiles = files.otherFiles || [];

  assertAttachmentLimits(referenceImages, otherFiles);

  for (const file of referenceImages) {
    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw AppError.badRequest('Reference images must be JPG, PNG, WEBP, or GIF');
    }
  }

  const uploaded = [];

  for (const file of referenceImages) {
    uploaded.push(await uploadAttachment({ inquiryId, file, kind: 'referenceImage' }));
  }

  for (const file of otherFiles) {
    uploaded.push(await uploadAttachment({ inquiryId, file, kind: 'otherFile' }));
  }

  return uploaded;
};

const deleteInquiryAttachments = async (attachments = []) => {
  if (!attachments.length) return;
  await storageService.deleteAssets([...attachments]);
};

module.exports = {
  uploadInquiryAttachments,
  deleteInquiryAttachments,
  MAX_INQUIRY_REFERENCE_IMAGES,
  MAX_INQUIRY_OTHER_FILES,
};
