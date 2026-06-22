const propertyInventoryService = require('../../services/customer/propertyInventory.customer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── Get Inventory by Property ID ─────────────────────────────────────────
const getInventoryByPropertyId = asyncHandler(async (req, res) => {
  const inventory = await propertyInventoryService.getInventoryByPropertyId(
    req.params.propertyId,
    req.customer._id
  );

  if (!inventory) {
    return ApiResponse.success(res, {
      message: 'No inventory found for this property',
      data: null,
    });
  }

  return ApiResponse.success(res, {
    message: 'Inventory fetched successfully',
    data: inventory,
  });
});

// ─── Get Single Inventory by ID ────────────────────────────────────────────
const getInventoryItem = asyncHandler(async (req, res) => {
  const inventory = await propertyInventoryService.getInventoryItemById(
    req.params.id,
    req.customer._id
  );

  return ApiResponse.success(res, {
    message: 'Inventory fetched successfully',
    data: inventory,
  });
});

// ─── Create or Update Property Inventory ───────────────────────────────────
const upsertPropertyInventory = asyncHandler(async (req, res) => {
  // Only owners can manage inventory
  if (!['owner'].includes(req.customer.accountType)) {
    throw AppError.forbidden('Only property owners can manage inventory');
  }

  const inventory = await propertyInventoryService.upsertPropertyInventory(
    req.customer._id,
    req.body
  );

  const message = inventory.createdAt === inventory.updatedAt
    ? 'Inventory created successfully'
    : 'Inventory updated successfully';

  return ApiResponse.success(res, {
    message,
    data: inventory,
  });
});

// ─── Update Single Inventory Item ──────────────────────────────────────────
const updateInventoryItem = asyncHandler(async (req, res) => {
  const inventory = await propertyInventoryService.updateInventoryItem(
    req.customer._id,
    req.params.id,
    req.params.itemId,
    req.body
  );

  return ApiResponse.success(res, {
    message: 'Inventory item updated successfully',
    data: inventory,
  });
});

// ─── Delete Single Inventory Item ──────────────────────────────────────────
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const inventory = await propertyInventoryService.deleteInventoryItem(
    req.customer._id,
    req.params.id,
    req.params.itemId
  );

  return ApiResponse.success(res, {
    message: 'Inventory item deleted successfully',
    data: inventory,
  });
});

// ─── Delete Entire Property Inventory ──────────────────────────────────────
const deletePropertyInventory = asyncHandler(async (req, res) => {
  const inventory = await propertyInventoryService.deletePropertyInventory(
    req.customer._id,
    req.params.id
  );

  return ApiResponse.success(res, {
    message: 'Inventory deleted successfully',
    data: inventory,
  });
});

// ─── Get Inventory Summary ─────────────────────────────────────────────────
const getInventorySummary = asyncHandler(async (req, res) => {
  const summary = await propertyInventoryService.getInventorySummary(
    req.customer._id
  );

  return ApiResponse.success(res, {
    message: 'Inventory summary fetched successfully',
    data: summary,
  });
});

module.exports = {
  getInventoryByPropertyId,
  getInventoryItem,
  upsertPropertyInventory,
  updateInventoryItem,
  deleteInventoryItem,
  deletePropertyInventory,
  getInventorySummary,
};