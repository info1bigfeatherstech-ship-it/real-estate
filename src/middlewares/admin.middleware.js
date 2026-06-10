const AppError = require('../errors/AppError');
const { ADMIN_ROLES } = require('../constants/userRoles');

const requireAdmin = (req, _res, next) => {
  if (!req.user) {
    return next(AppError.unauthorized());
  }

  if (!ADMIN_ROLES.includes(req.user.role)) {
    return next(AppError.forbidden('Admin access required'));
  }

  return next();
};

module.exports = { requireAdmin };
