const express = require('express');
const inventoryItemController = require('../../controllers/admin/inventoryItem.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');
const {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  toggleInventoryItemStatusSchema,
  listInventoryItemsQuerySchema,
  inventoryItemIdParamSchema,
} = require('../../validators/admin/inventoryItem.admin.validator');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// ─── Seed Default Items ───────────────────────────────────────────────────
router.post('/seed', inventoryItemController.seedDefaultInventoryItems);

// ─── List & Create ──────────────────────────────────────────────────────
router.get(
  '/',
  validate(listInventoryItemsQuerySchema, 'query'),
  inventoryItemController.listInventoryItems
);

router.post(
  '/',
  validate(createInventoryItemSchema),
  inventoryItemController.createInventoryItem
);

// ─── Get, Update, Toggle Status, Delete ───────────────────────────────────
router.get(
  '/:id',
  validate(inventoryItemIdParamSchema, 'params'),
  inventoryItemController.getInventoryItem
);

router.put(
  '/:id',
  validate(inventoryItemIdParamSchema, 'params'),
  validate(updateInventoryItemSchema),
  inventoryItemController.updateInventoryItem
);

router.patch(
  '/:id/status',
  validate(inventoryItemIdParamSchema, 'params'),
  validate(toggleInventoryItemStatusSchema),
  inventoryItemController.toggleInventoryItemStatus
);

router.delete(
  '/:id',
  validate(inventoryItemIdParamSchema, 'params'),
  inventoryItemController.deleteInventoryItem
);

module.exports = router;