const multer = require('multer');
const env = require('../config/env');
const AppError = require('../errors/AppError');
const {
  MAX_INQUIRY_REFERENCE_IMAGES,
  MAX_INQUIRY_OTHER_FILES,
} = require('../constants/accommodationInquiryEnums');

const memoryStorage = multer.memoryStorage();

const createUploader = (maxSizeMb, maxFiles = 1) =>
  multer({
    storage: memoryStorage,
    limits: {
      fileSize: maxSizeMb * 1024 * 1024,
      files: maxFiles,
    },
  });

const uploadImage = createUploader(env.media.maxImageSizeMb);
const uploadDocument = createUploader(env.media.maxDocumentSizeMb);

const uploadInquiryAttachments = createUploader(
  env.media.maxDocumentSizeMb,
  MAX_INQUIRY_REFERENCE_IMAGES + MAX_INQUIRY_OTHER_FILES
).fields([
  { name: 'referenceImages', maxCount: MAX_INQUIRY_REFERENCE_IMAGES },
  { name: 'otherFiles', maxCount: MAX_INQUIRY_OTHER_FILES },
]);

const handleMulterError = (err, req, _res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const isDocumentRoute = req.originalUrl.includes('/documents');
      const isInquiryRoute = req.originalUrl.includes('/accommodation-inquiries');
      const limitMb = isDocumentRoute || isInquiryRoute
        ? env.media.maxDocumentSizeMb
        : env.media.maxImageSizeMb;
      return next(AppError.fileUpload(`File size exceeds the ${limitMb}MB limit`));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(AppError.fileUpload('Too many files uploaded'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(AppError.fileUpload('Unexpected file field uploaded'));
    }
    return next(AppError.fileUpload(err.message));
  }
  return next(err);
};

module.exports = { uploadImage, uploadDocument, uploadInquiryAttachments, handleMulterError };
