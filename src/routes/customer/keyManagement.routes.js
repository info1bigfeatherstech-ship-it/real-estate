const express = require('express');
const keyController = require('../../controllers/customer/keyManagement.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');
const {
  createKeySchema,
  moveKeySchema,
  returnKeySchema,
  updateKeyStatusSchema,
  listKeysQuerySchema,
  keyIdParamSchema,
} = require('../../validators/customer/keyManagement.validator');

const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// ─── Summary ──────────────────────────────────────────────────────────────
router.get('/summary', keyController.getKeySummary);

// ─── Get Keys by Property ─────────────────────────────────────────────────
router.get('/property/:propertyId', keyController.getPropertyKeys);

// ─── Get Keys by Holder ───────────────────────────────────────────────────
router.get('/holder/:holderId', keyController.getKeysByHolder);

// ─── List & Create ──────────────────────────────────────────────────────
router.get('/', validate(listKeysQuerySchema, 'query'), keyController.listKeys);

router.post(
  '/',
  validate(createKeySchema),
  keyController.createKey
);

// ─── Get, Update, Delete ────────────────────────────────────────────────
router.get(
  '/:id',
  validate(keyIdParamSchema, 'params'),
  keyController.getKey
);

// ─── Move Key ────────────────────────────────────────────────────────────
router.post(
  '/:id/move',
  validate(keyIdParamSchema, 'params'),
  validate(moveKeySchema),
  keyController.moveKey
);

// ─── Return Key ───────────────────────────────────────────────────────────
router.post(
  '/:id/return',
  validate(keyIdParamSchema, 'params'),
  validate(returnKeySchema),
  keyController.returnKey
);

// ─── Update Status ──────────────────────────────────────────────────────
router.patch(
  '/:id/status',
  validate(keyIdParamSchema, 'params'),
  validate(updateKeyStatusSchema),
  keyController.updateKeyStatus
);

// ─── Delete Key ──────────────────────────────────────────────────────────
router.delete(
  '/:id',
  validate(keyIdParamSchema, 'params'),
  keyController.deleteKey
);

// ─── Get Key History ─────────────────────────────────────────────────────
router.get(
  '/:id/history',
  validate(keyIdParamSchema, 'params'),
  keyController.getKeyHistory
);

module.exports = router;