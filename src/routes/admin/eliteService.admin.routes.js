const express = require('express');
const eliteServiceController = require('../../controllers/admin/eliteService.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  createEliteServiceSchema,
  updateEliteServiceSchema,
  updateEliteServiceStatusSchema,
  listEliteServicesQuerySchema,
  eliteServiceIdParamSchema,
} = require('../../validators/admin/eliteService.admin.validator');

const router = express.Router();

router.get('/stats', eliteServiceController.getEliteServiceStats);
router.get('/', validate(listEliteServicesQuerySchema, 'query'), eliteServiceController.listEliteServices);
router.post('/', validate(createEliteServiceSchema), eliteServiceController.createEliteService);
router.get('/:id', validate(eliteServiceIdParamSchema, 'params'), eliteServiceController.getEliteService);
router.put(
  '/:id',
  validate(eliteServiceIdParamSchema, 'params'),
  validate(updateEliteServiceSchema),
  eliteServiceController.updateEliteService
);
router.patch(
  '/:id/status',
  validate(eliteServiceIdParamSchema, 'params'),
  validate(updateEliteServiceStatusSchema),
  eliteServiceController.updateEliteServiceStatus
);
router.delete(
  '/:id',
  validate(eliteServiceIdParamSchema, 'params'),
  eliteServiceController.deleteEliteService
);

module.exports = router;
