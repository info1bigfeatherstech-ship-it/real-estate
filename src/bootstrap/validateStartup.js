const env = require('../config/env');
const logger = require('../utils/logger');

const validateStartupConfig = () => {
  const errors = [];
  const warnings = [];

  if (!env.mongodbUri) {
    errors.push('MONGODB_URI is required');
  }

  if (!env.jwt.accessSecret || env.jwt.accessSecret.length < 32) {
    errors.push('JWT_ACCESS_SECRET must be at least 32 characters');
  }

  if (!env.jwt.refreshSecret || env.jwt.refreshSecret.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters');
  }

  if (env.jwt.accessSecret === env.jwt.refreshSecret) {
    warnings.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET should be different values');
  }

  if (env.media.storageProvider === 'cloudinary') {
    if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
      errors.push('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required when MEDIA_STORAGE_PROVIDER=cloudinary');
    }
  }

  if (env.media.storageProvider === 'r2') {
    const r2Required = [
      ['R2_BUCKET_NAME', env.r2.bucketName],
      ['R2_ACCESS_KEY_ID', env.r2.accessKeyId],
      ['R2_SECRET_ACCESS_KEY', env.r2.secretAccessKey],
      ['R2_ENDPOINT', env.r2.endpoint],
      ['R2_PUBLIC_BASE_URL', env.r2.publicBaseUrl],
    ];

    r2Required.forEach(([name, value]) => {
      if (!value) errors.push(`${name} is required when MEDIA_STORAGE_PROVIDER=r2`);
    });
  }

  if (env.isProduction) {
    if (env.corsOrigins.includes('*') || env.corsOrigins.length === 0) {
      warnings.push('CORS_ORIGIN should list explicit frontend origins in production');
    }

    const defaultSecrets = [
      'change-this-to-a-long-random-secret-min-32-chars',
      'change-this-to-another-long-random-secret-min-32-chars',
    ];

    if (defaultSecrets.includes(env.jwt.accessSecret) || defaultSecrets.includes(env.jwt.refreshSecret)) {
      errors.push('Default JWT secrets detected — set strong secrets before production deployment');
    }

    if (env.media.storageProvider === 'local') {
      warnings.push('MEDIA_STORAGE_PROVIDER=local in production — use cloudinary or r2 for production deployments');
    }
  }

  if (errors.length) {
    errors.forEach((message) => logger.error({ message }, '[Config] Startup validation error'));
    throw new Error('Startup configuration validation failed');
  }

  warnings.forEach((message) => logger.warn({ message }, '[Config] Startup validation warning'));
};

module.exports = { validateStartupConfig };
