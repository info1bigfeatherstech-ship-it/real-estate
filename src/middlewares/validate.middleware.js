const AppError = require('../errors/AppError');

const validate = (schema, property = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return next(AppError.badRequest('Validation failed', details));
  }

  req[property] = value;
  return next();
};

module.exports = { validate };
