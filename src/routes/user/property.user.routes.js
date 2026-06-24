const express = require('express');
const propertyController = require('../../controllers/user/property.user.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  listPropertiesQuerySchema,
  propertyIdParamSchema,
  listingIdParamSchema,
  relatedPropertiesQuerySchema,
} = require('../../validators/user/property.user.validator');
const { optionalAuthenticateCustomer } = require('../../middlewares/customerAuth.middleware');

const router = express.Router();

router.get('/', validate(listPropertiesQuerySchema, 'query'), optionalAuthenticateCustomer, propertyController.listProperties);

router.get(
  '/listing/:listingId',
  validate(listingIdParamSchema, 'params'),
  optionalAuthenticateCustomer,
  propertyController.getPropertyByListingId
);

router.get(
  '/:id/related',
  validate(propertyIdParamSchema, 'params'),
  validate(relatedPropertiesQuerySchema, 'query'),
  optionalAuthenticateCustomer,
  propertyController.getRelatedProperties
);

router.get(
  '/:id',
  validate(propertyIdParamSchema, 'params'),
  optionalAuthenticateCustomer,
  propertyController.getPropertyById
);

module.exports = router;
