const path = require('path');
const AppError = require('../errors/AppError');
const storageService = require('./storage/storage.service');
const { buildInquiryStorageKey } = require('../utils/storageKey');
const { MAX_INQUIRY_ATTACHMENTS } = require('../constants/inquiryEnums');

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const uploadAttachment = async ({ inquiryId, file, category }) => {
  const extension = path.extname(file.originalname || '').toLowerCase() || '.bin';
  const safeCategory = String(category || 'other').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
  const storageKey = buildInquiryStorageKey({
    inquiryId,
    assetType: safeCategory,
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
    category: safeCategory,
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
  const allFiles = [];

  if (Array.isArray(files.attachments)) {
    files.attachments.forEach((file) => allFiles.push({ file, category: 'attachment' }));
  }

  Object.entries(files).forEach(([fieldName, fileList]) => {
    if (fieldName === 'attachments') return;
    const list = Array.isArray(fileList) ? fileList : fileList ? [fileList] : [];
    list.forEach((file) => {
      if (file?.buffer) {
        allFiles.push({ file, category: fieldName });
      }
    });
  });

  if (allFiles.length > MAX_INQUIRY_ATTACHMENTS) {
    throw AppError.badRequest(`Maximum ${MAX_INQUIRY_ATTACHMENTS} attachments allowed per inquiry`);
  }

  const uploaded = [];
  for (const { file, category } of allFiles) {
    uploaded.push(await uploadAttachment({ inquiryId, file, category }));
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
};
