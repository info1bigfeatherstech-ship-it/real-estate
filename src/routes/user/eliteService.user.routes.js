const express = require('express');
const eliteServiceController = require('../../controllers/user/eliteService.user.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  listEliteServicesQuerySchema,
  eliteServiceIdParamSchema,
} = require('../../validators/user/eliteService.user.validator');

const router = express.Router();

router.get('/roles', eliteServiceController.listAvailableRoles);
router.get('/', validate(listEliteServicesQuerySchema, 'query'), eliteServiceController.listEliteServices);
router.get(
  '/:id',
  validate(eliteServiceIdParamSchema, 'params'),
  eliteServiceController.getEliteServiceById
);

module.exports = router;
