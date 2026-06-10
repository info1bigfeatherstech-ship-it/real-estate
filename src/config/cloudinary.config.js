const { v2: cloudinary } = require('cloudinary');
const env = require('./env');

let configured = false;

const initCloudinary = () => {
  if (configured || env.media.storageProvider !== 'cloudinary') return;

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });

  configured = true;
};

module.exports = { cloudinary, initCloudinary };
