const AppError = require('../errors/AppError');
const { verifyAccessToken } = require('../utils/token');
const User = require('../models/User.model');

const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub).select('_id name email role isActive');

    if (!user || !user.isActive) {
      throw AppError.unauthorized('User account is inactive or does not exist');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Invalid or expired access token'));
    }
    return next(error);
  }
};

module.exports = { authenticate };
