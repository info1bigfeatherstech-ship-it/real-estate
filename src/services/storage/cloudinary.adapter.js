const { cloudinary, initCloudinary } = require('../../config/cloudinary.config');
const logger = require('../../utils/logger');

const ensureReady = () => initCloudinary();

const upload = ({ buffer, storageKey, contentType }) => {
  ensureReady();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: storageKey.replace(/\.[^/.]+$/, ''),
        folder: '',
        resource_type: 'image',
        format: 'webp',
        overwrite: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({
          url: result.secure_url,
          storageKey: result.public_id,
          storageProvider: 'cloudinary',
          mimeType: contentType || 'image/webp',
          fileSize: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

const uploadDocument = ({ buffer, storageKey, contentType }) => {
  ensureReady();
  return new Promise((resolve, reject) => {
    const isImage = String(contentType || '').startsWith('image/');
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: storageKey.replace(/\.[^/.]+$/, ''),
        folder: '',
        resource_type: isImage ? 'image' : 'raw',
        overwrite: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({
          url: result.secure_url,
          storageKey: result.public_id,
          storageProvider: 'cloudinary',
          mimeType: contentType || result.format,
          fileSize: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

const remove = async ({ storageKey, mimeType }) => {
  if (!storageKey) return;

  const resourceType = String(mimeType || '').startsWith('image/') ? 'image' : 'raw';

  try {
    await cloudinary.uploader.destroy(storageKey, { resource_type: resourceType });
  } catch (error) {
    logger.warn({ storageKey, err: error.message }, 'Failed to delete Cloudinary asset');
  }
};

const removeMany = async (assets) => {
  await Promise.all(assets.map((asset) => remove(asset)));
};

module.exports = { upload, uploadDocument, remove, removeMany };
