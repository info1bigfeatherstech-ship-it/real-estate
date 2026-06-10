const env = require('../../config/env');
const localAdapter = require('./local.adapter');
const cloudinaryAdapter = require('./cloudinary.adapter');
const r2Adapter = require('./r2.adapter');

const adapters = {
  local: localAdapter,
  cloudinary: cloudinaryAdapter,
  r2: r2Adapter,
};

const getActiveProvider = () => env.media.storageProvider;

const getAdapter = (provider = getActiveProvider()) => {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unsupported storage provider: ${provider}`);
  }
  return adapter;
};

const uploadImage = async (payload) => {
  const adapter = getAdapter();
  return adapter.upload(payload);
};

const uploadDocument = async (payload) => {
  const adapter = getAdapter();
  if (typeof adapter.uploadDocument === 'function') {
    return adapter.uploadDocument(payload);
  }
  return adapter.upload(payload);
};

const deleteAsset = async (asset) => {
  if (!asset?.storageKey) return;

  const provider = asset.storageProvider || getActiveProvider();
  const adapter = getAdapter(provider);
  await adapter.remove({
    storageKey: asset.storageKey,
    mimeType: asset.mimeType,
  });
};

const deleteAssets = async (assets = []) => {
  if (!assets.length) return;

  const grouped = assets.reduce((acc, asset) => {
    if (!asset?.storageKey) return acc;
    const provider = asset.storageProvider || getActiveProvider();
    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(asset);
    return acc;
  }, {});

  await Promise.all(
    Object.entries(grouped).map(([provider, providerAssets]) =>
      getAdapter(provider).removeMany(providerAssets)
    )
  );
};

module.exports = {
  getActiveProvider,
  uploadImage,
  uploadDocument,
  deleteAsset,
  deleteAssets,
};
