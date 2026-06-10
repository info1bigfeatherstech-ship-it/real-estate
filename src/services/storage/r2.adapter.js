const { PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { getR2Client } = require('../../config/r2.config');
const env = require('../../config/env');
const logger = require('../../utils/logger');

const buildPublicUrl = (storageKey) => `${env.r2.publicBaseUrl}/${storageKey}`;

const upload = async ({ buffer, storageKey, contentType }) => {
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: env.r2.bucketName,
      Key: storageKey,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return {
    url: buildPublicUrl(storageKey),
    storageKey,
    storageProvider: 'r2',
    mimeType: contentType,
    fileSize: buffer.length,
  };
};

const remove = async ({ storageKey }) => {
  if (!storageKey) return;

  const client = getR2Client();

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: env.r2.bucketName,
        Key: storageKey,
      })
    );
  } catch (error) {
    logger.warn({ storageKey, err: error.message }, 'Failed to delete R2 object');
  }
};

const removeMany = async (assets) => {
  const keys = assets.map((a) => a.storageKey).filter(Boolean);
  if (!keys.length) return;

  const client = getR2Client();

  try {
    await client.send(
      new DeleteObjectsCommand({
        Bucket: env.r2.bucketName,
        Delete: {
          Objects: keys.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );
  } catch (error) {
    logger.warn({ count: keys.length, err: error.message }, 'Failed to batch delete R2 objects');
    await Promise.all(assets.map((asset) => remove(asset)));
  }
};

module.exports = { upload, remove, removeMany };
