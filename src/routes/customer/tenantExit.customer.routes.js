const express = require('express');
const tenantExitController = require('../../controllers/customer/tenantExit.customer.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');
const { uploadTenantPhotos, handleMulterError } = require('../../middlewares/upload.middleware'); // ← ADD
const {
  createTenantExitSchema,
  updateTenantExitSchema,
  listTenantExitsQuerySchema,
  tenantExitIdParamSchema,
  entryRecordIdParamSchema,
} = require('../../validators/customer/tenantExit.customer.validator');

const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// ─── Summary ──────────────────────────────────────────────────────────────
router.get('/summary', tenantExitController.getTenantExitSummary);

// ─── Get Entry for Auto-fill ─────────────────────────────────────────────
router.get(
  '/entry/:entryId',
  validate(entryRecordIdParamSchema, 'params'),
  tenantExitController.getEntryForExit
);

// ─── Get Exit by Entry ───────────────────────────────────────────────────
router.get(
  '/entry/:entryId/exit',
  validate(entryRecordIdParamSchema, 'params'),
  tenantExitController.getTenantExitByEntry
);

// ─── List ────────────────────────────────────────────────────────────────
router.get(
  '/',
  validate(listTenantExitsQuerySchema, 'query'),
  tenantExitController.listTenantExits
);

// ─── Create Tenant Exit (WITH PHOTO UPLOAD) ─────────────────────────────
router.post(
  '/',
  authenticateCustomer,
  uploadTenantPhotos,        // ← ADD THIS
  handleMulterError,         // ← ADD THIS
  validate(createTenantExitSchema),
  tenantExitController.createTenantExit
);

// ─── Get, Update, Delete ────────────────────────────────────────────────
router.get(
  '/:id',
  validate(tenantExitIdParamSchema, 'params'),
  tenantExitController.getTenantExit
);

router.put(
  '/:id',
  validate(tenantExitIdParamSchema, 'params'),
  validate(updateTenantExitSchema),
  tenantExitController.updateTenantExit
);

router.delete(
  '/:id',
  validate(tenantExitIdParamSchema, 'params'),
  tenantExitController.deleteTenantExit
);

module.exports = router;