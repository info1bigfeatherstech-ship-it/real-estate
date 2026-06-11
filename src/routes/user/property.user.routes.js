const express = require('express');
const propertyController = require('../../controllers/user/property.user.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  listPropertiesQuerySchema,
  propertyIdParamSchema,
  listingIdParamSchema,
  relatedPropertiesQuerySchema,
} = require('../../validators/user/property.user.validator');

const router = express.Router();

router.get('/', validate(listPropertiesQuerySchema, 'query'), propertyController.listProperties);

router.get(
  '/listing/:listingId',
  validate(listingIdParamSchema, 'params'),
  propertyController.getPropertyByListingId
);

router.get(
  '/:id/related',
  validate(propertyIdParamSchema, 'params'),
  validate(relatedPropertiesQuerySchema, 'query'),
  propertyController.getRelatedProperties
);

router.get(
  '/:id',
  validate(propertyIdParamSchema, 'params'),
  propertyController.getPropertyById
);

module.exports = router;
