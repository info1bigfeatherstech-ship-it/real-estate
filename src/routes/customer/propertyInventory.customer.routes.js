const express = require('express');
const inventoryController = require('../../controllers/customer/propertyInventory.customer.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');
const {
  upsertPropertyInventorySchema,
  updateInventoryItemSchema,
  listPropertyInventoryQuerySchema,
  propertyInventoryIdParamSchema,
  propertyIdParamSchema,
} = require('../../validators/customer/propertyInventory.customer.validator');

const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// ─── Summary ────────────────────────────────────────────────────────────────
router.get('/summary', inventoryController.getInventorySummary);

// ─── Get Master Items for Customer Dropdowns ────────────────────────────────
router.get('/master-items', inventoryController.getMasterItems);

// ─── Get Inventory by Property ID ──────────────────────────────────────────
router.get(
  '/property/:propertyId',
  validate(propertyIdParamSchema, 'params'),
  inventoryController.getInventoryByPropertyId
);

// ─── Create or Update Inventory ────────────────────────────────────────────
router.post(
  '/',
  validate(upsertPropertyInventorySchema),
  inventoryController.upsertPropertyInventory
);

// ─── Get, Update, Delete Inventory by ID ──────────────────────────────────
router.get(
  '/:id',
  validate(propertyInventoryIdParamSchema, 'params'),
  inventoryController.getInventoryItem
);

// ─── Update Single Inventory Item ──────────────────────────────────────────
router.patch(
  '/:id/items/:itemId',
  validate(propertyInventoryIdParamSchema, 'params'),
  validate(updateInventoryItemSchema),
  inventoryController.updateInventoryItem
);

// ─── Delete Single Inventory Item ──────────────────────────────────────────
router.delete(
  '/:id/items/:itemId',
  validate(propertyInventoryIdParamSchema, 'params'),
  inventoryController.deleteInventoryItem
);

// ─── Delete Entire Inventory ──────────────────────────────────────────────
router.delete(
  '/:id',
  validate(propertyInventoryIdParamSchema, 'params'),
  inventoryController.deletePropertyInventory
);

module.exports = router;