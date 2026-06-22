const express = require('express');
const tenantEntryController = require('../../controllers/customer/tenantEntry.customer.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');
const {
  createTenantEntrySchema,
  updateTenantEntrySchema,
  listTenantEntriesQuerySchema,
  tenantEntryIdParamSchema,
  propertyIdParamSchema,
} = require('../../validators/customer/tenantEntry.customer.validator');

const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// ─── Summary ──────────────────────────────────────────────────────────────
router.get('/summary', tenantEntryController.getTenantSummary);

// ─── Get by Property ──────────────────────────────────────────────────────
router.get(
  '/property/:propertyId',
  validate(propertyIdParamSchema, 'params'),
  tenantEntryController.getTenantEntriesByProperty
);

// ─── List & Create ──────────────────────────────────────────────────────
router.get(
  '/',
  validate(listTenantEntriesQuerySchema, 'query'),
  tenantEntryController.listTenantEntries
);

router.post(
  '/',
  validate(createTenantEntrySchema),
  tenantEntryController.createTenantEntry
);

// ─── Get, Update, Delete ────────────────────────────────────────────────
router.get(
  '/:id',
  validate(tenantEntryIdParamSchema, 'params'),
  tenantEntryController.getTenantEntry
);

router.put(
  '/:id',
  validate(tenantEntryIdParamSchema, 'params'),
  validate(updateTenantEntrySchema),
  tenantEntryController.updateTenantEntry
);

router.delete(
  '/:id',
  validate(tenantEntryIdParamSchema, 'params'),
  tenantEntryController.deleteTenantEntry
);

module.exports = router;