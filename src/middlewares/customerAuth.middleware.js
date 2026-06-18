const AppError = require('../errors/AppError');
const { verifyAccessToken } = require('../utils/token');
const Customer = require('../models/Customer.model');
const { TOKEN_TYPE } = require('../services/customer/auth.customer.service');

const authenticateCustomer = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded.tokenType !== TOKEN_TYPE) {
      throw AppError.unauthorized('Invalid access token for customer');
    }

    const customer = await Customer.findById(decoded.sub).select(
      '_id fullName email mobile accountType emailVerified isActive'
    );

    if (!customer || !customer.isActive || !customer.emailVerified) {
      throw AppError.unauthorized('Customer account is inactive or not verified');
    }

    req.customer = customer;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Invalid or expired access token'));
    }
    return next(error);
  }
};

module.exports = { authenticateCustomer };
