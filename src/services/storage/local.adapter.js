const path = require('path');
const fs = require('fs').promises;
const env = require('../../config/env');
const { buildLocalPublicUrl } = require('../../utils/storageKey');
const logger = require('../../utils/logger');

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');

const ensureParentDir = async (absolutePath) => {
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
};

const upload = async ({ buffer, storageKey, contentType }) => {
  const absolutePath = path.join(UPLOAD_ROOT, storageKey);
  await ensureParentDir(absolutePath);
  await fs.writeFile(absolutePath, buffer);

  return {
    url: buildLocalPublicUrl(storageKey),
    storageKey,
    storageProvider: 'local',
    mimeType: contentType,
    fileSize: buffer.length,
  };
};

const remove = async ({ storageKey }) => {
  if (!storageKey) return;

  const absolutePath = path.join(UPLOAD_ROOT, storageKey);
  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn({ storageKey, err: error.message }, 'Failed to delete local file');
    }
  }
};

const removeMany = async (assets) => {
  await Promise.all(assets.map((asset) => remove(asset)));
};

module.exports = { upload, remove, removeMany };
