const Joi = require('joi');

const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(5000),
  API_PREFIX: Joi.string().default('/api/v1'),
  PUBLIC_API_BASE_URL: Joi.string().allow('').default(''),
  MONGODB_URI: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('30m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('10d'),
  REFRESH_TOKEN_COOKIE_NAME: Joi.string().default('estate_refresh_token'),
  COOKIE_DOMAIN: Joi.string().allow('').default(''),
  COOKIE_SECURE: Joi.string().allow('').default(''),
  COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('lax'),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  EXPRESS_TRUST_PROXY: Joi.string().allow('').default(''),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().integer().positive().default(100),
  MEDIA_STORAGE_PROVIDER: Joi.string().valid('local', 'cloudinary', 'r2').default('local'),
  MAX_IMAGE_SIZE_MB: Joi.number().positive().default(60),
  MAX_DOCUMENT_SIZE_MB: Joi.number().positive().default(60),
  MAX_PROPERTY_MEDIA: Joi.number().integer().positive().default(10),
  MAX_PROPERTY_DOCUMENTS: Joi.number().integer().positive().default(30),
  IMAGE_WEBP_QUALITY: Joi.number().integer().min(1).max(100).default(80),
  IMAGE_MAX_WIDTH: Joi.number().integer().positive().default(1920),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').default(''),
  CLOUDINARY_API_KEY: Joi.string().allow('').default(''),
  CLOUDINARY_API_SECRET: Joi.string().allow('').default(''),
  R2_BUCKET_NAME: Joi.string().allow('').default(''),
  R2_ACCESS_KEY_ID: Joi.string().allow('').default(''),
  R2_SECRET_ACCESS_KEY: Joi.string().allow('').default(''),
  R2_ENDPOINT: Joi.string().allow('').default(''),
  R2_PUBLIC_BASE_URL: Joi.string().allow('').default(''),
}).unknown(true);

const { error, value: env } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: false,
});

if (error) {
  const details = error.details.map((d) => d.message).join('\n  - ');
  throw new Error(`Environment validation failed:\n  - ${details}`);
}

const resolveTrustProxy = () => {
  const raw = String(env.EXPRESS_TRUST_PROXY || '').trim();
  const isProduction = env.NODE_ENV === 'production';

  if (!raw) return isProduction ? 1 : false;

  const normalized = raw.toLowerCase();
  if (['true', 'yes', 'on'].includes(normalized)) return true;
  if (['false', 'no', 'off'].includes(normalized)) return false;
  if (/^\d+$/.test(normalized)) return Number.parseInt(normalized, 10);

  return raw;
};

module.exports = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiPrefix: env.API_PREFIX,
  publicApiBaseUrl: String(env.PUBLIC_API_BASE_URL || '').trim().replace(/\/$/, ''),
  mongodbUri: env.MONGODB_URI,
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  corsOrigins: parseOrigins(env.CORS_ORIGIN),
  trustProxy: resolveTrustProxy(),
  cookie: {
    refreshTokenName: env.REFRESH_TOKEN_COOKIE_NAME,
    domain: env.COOKIE_DOMAIN || null,
    secure: env.COOKIE_SECURE
      ? ['true', '1', 'yes'].includes(env.COOKIE_SECURE.toLowerCase())
      : env.NODE_ENV === 'production',
    sameSite: env.COOKIE_SAME_SITE,
    path: `${env.API_PREFIX}/admin/auth`,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  media: {
    storageProvider: env.MEDIA_STORAGE_PROVIDER,
    maxImageSizeMb: env.MAX_IMAGE_SIZE_MB,
    maxDocumentSizeMb: env.MAX_DOCUMENT_SIZE_MB,
    maxPropertyMedia: env.MAX_PROPERTY_MEDIA,
    maxPropertyDocuments: env.MAX_PROPERTY_DOCUMENTS,
    webpQuality: env.IMAGE_WEBP_QUALITY,
    imageMaxWidth: env.IMAGE_MAX_WIDTH,
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  r2: {
    bucketName: env.R2_BUCKET_NAME,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    endpoint: env.R2_ENDPOINT,
    publicBaseUrl: String(env.R2_PUBLIC_BASE_URL || '').trim().replace(/\/$/, ''),
  },
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
};
