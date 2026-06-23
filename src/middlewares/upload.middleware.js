const multer = require('multer');
const env = require('../config/env');
const AppError = require('../errors/AppError');
const {
  MAX_INQUIRY_REFERENCE_IMAGES,
  MAX_INQUIRY_OTHER_FILES,
} = require('../constants/accommodationInquiryEnums');
const { MAX_INQUIRY_ATTACHMENTS } = require('../constants/inquiryEnums');

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

/** Accepts any attachment field names for unified inquiry forms (buy, sell, listing). */
const uploadFlexibleInquiryAttachments = multer({
  storage: memoryStorage,
  limits: {
    fileSize: env.media.maxDocumentSizeMb * 1024 * 1024,
    files: MAX_INQUIRY_ATTACHMENTS,
  },
}).any();

// ─── ✅ TENANT PHOTO UPLOAD (NEW) ─────────────────────────────────────────
const uploadTenantPhotos = multer({
  storage: memoryStorage,
  limits: {
    fileSize: env.media.maxImageSizeMb * 1024 * 1024,
    files: 20, // Max 20 photos
  },
}).fields([
  { name: 'roomPhotos', maxCount: 10 },
  { name: 'furniturePhotos', maxCount: 10 },
  { name: 'appliancePhotos', maxCount: 10 },
  { name: 'meterPhotos', maxCount: 10 },
  { name: 'damagePhotos', maxCount: 10 },
  { name: 'exitRoomPhotos', maxCount: 10 },
  { name: 'exitDamagePhotos', maxCount: 10 },
  { name: 'exitMeterPhotos', maxCount: 10 },
]);



const handleMulterError = (err, req, _res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const isDocumentRoute = req.originalUrl.includes('/documents');
      const isInquiryRoute =
        req.originalUrl.includes('/accommodation-inquiries') ||
        req.originalUrl.includes('/inquiries');
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

module.exports = {
  uploadImage,
  uploadDocument,
  uploadInquiryAttachments,
  uploadFlexibleInquiryAttachments,
  uploadTenantPhotos,
  handleMulterError,
};
