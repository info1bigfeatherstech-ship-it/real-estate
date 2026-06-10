const multer = require('multer');
const env = require('../config/env');
const AppError = require('../errors/AppError');

const memoryStorage = multer.memoryStorage();

const createUploader = (maxSizeMb) =>
  multer({
    storage: memoryStorage,
    limits: {
      fileSize: maxSizeMb * 1024 * 1024,
      files: 1,
    },
  });

const uploadImage = createUploader(env.media.maxImageSizeMb);
const uploadDocument = createUploader(env.media.maxDocumentSizeMb);

const handleMulterError = (err, req, _res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const isDocumentRoute = req.originalUrl.includes('/documents');
      const limitMb = isDocumentRoute ? env.media.maxDocumentSizeMb : env.media.maxImageSizeMb;
      return next(AppError.fileUpload(`File size exceeds the ${limitMb}MB limit`));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(AppError.fileUpload('Too many files uploaded'));
    }
    return next(AppError.fileUpload(err.message));
  }
  return next(err);
};

module.exports = { uploadImage, uploadDocument, handleMulterError };
