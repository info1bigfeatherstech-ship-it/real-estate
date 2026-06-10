const sharp = require('sharp');
const env = require('../../config/env');
const AppError = require('../../errors/AppError');

const processImageToWebp = async (inputBuffer) => {
  try {
    const result = await sharp(inputBuffer, { failOn: 'none' })
      .rotate()
      .resize({
        width: env.media.imageMaxWidth,
        withoutEnlargement: true,
      })
      .webp({ quality: env.media.webpQuality })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: result.data,
      mimeType: 'image/webp',
      fileSize: result.info.size,
      width: result.info.width,
      height: result.info.height,
    };
  } catch {
    throw AppError.badRequest('Invalid or unsupported image file');
  }
};

module.exports = { processImageToWebp };
