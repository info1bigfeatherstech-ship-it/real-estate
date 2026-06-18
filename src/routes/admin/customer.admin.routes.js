const express = require('express');
const customerController = require('../../controllers/admin/customer.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  listCustomersQuerySchema,
  customerIdParamSchema,
  updateCustomerStatusSchema,
} = require('../../validators/admin/inquiry.admin.validator');

const router = express.Router();

router.get('/stats', customerController.getCustomerStats);
router.get('/', validate(listCustomersQuerySchema, 'query'), customerController.listCustomers);
router.get('/:id', validate(customerIdParamSchema, 'params'), customerController.getCustomer);
router.patch(
  '/:id/status',
  validate(customerIdParamSchema, 'params'),
  validate(updateCustomerStatusSchema),
  customerController.updateCustomerStatus
);

module.exports = router;
