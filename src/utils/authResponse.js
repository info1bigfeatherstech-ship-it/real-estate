const env = require('../config/env');

const buildAuthResponse = ({ user, accessToken }) => {
  const payload = {
    accessToken,
    expiresIn: env.jwt.accessExpiresIn,
    tokenType: 'Bearer',
  };

  if (user) payload.user = user;
  return payload;
};

module.exports = { buildAuthResponse };
