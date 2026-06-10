const { S3Client } = require('@aws-sdk/client-s3');
const env = require('./env');

let client = null;

const getR2Client = () => {
  if (client) return client;

  client = new S3Client({
    region: 'auto',
    endpoint: env.r2.endpoint,
    credentials: {
      accessKeyId: env.r2.accessKeyId,
      secretAccessKey: env.r2.secretAccessKey,
    },
  });

  return client;
};

module.exports = { getR2Client };
