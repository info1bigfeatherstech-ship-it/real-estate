const inventoryItemService = require('../../services/admin/inventoryItem.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── List Inventory Items ─────────────────────────────────────────────────
const listInventoryItems = asyncHandler(async (req, res) => {
  const result = await inventoryItemService.listInventoryItems(req.query);
  return ApiResponse.success(res, {
    message: 'Inventory items fetched successfully',
    data: result.items,
    meta: result.meta,
  });
});

// ─── Get Single Inventory Item ────────────────────────────────────────────
const getInventoryItem = asyncHandler(async (req, res) => {
  const item = await inventoryItemService.getInventoryItemById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Inventory item fetched successfully',
    data: item,
  });
});

// ─── Create Inventory Item ────────────────────────────────────────────────
const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await inventoryItemService.createInventoryItem(req.body, req.user._id);
  return ApiResponse.created(res, 'Inventory item created successfully', item);
});

// ─── Update Inventory Item ────────────────────────────────────────────────
const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await inventoryItemService.updateInventoryItem(
    req.params.id,
    req.body,
    req.user._id
  );
  return ApiResponse.success(res, {
    message: 'Inventory item updated successfully',
    data: item,
  });
});

// ─── Toggle Inventory Item Status ─────────────────────────────────────────
const toggleInventoryItemStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const item = await inventoryItemService.toggleInventoryItemStatus(
    req.params.id,
    isActive,
    req.user._id
  );
  return ApiResponse.success(res, {
    message: `Inventory item ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: item,
  });
});

// ─── Delete Inventory Item ────────────────────────────────────────────────
const deleteInventoryItem = asyncHandler(async (req, res) => {
  await inventoryItemService.deleteInventoryItem(req.params.id);
  return ApiResponse.success(res, {
    message: 'Inventory item deleted successfully',
  });
});

// ─── Seed Default Inventory Items ─────────────────────────────────────────
const seedDefaultInventoryItems = asyncHandler(async (req, res) => {
  const items = await inventoryItemService.seedDefaultInventoryItems(req.user._id);
  return ApiResponse.created(res, {
    message: `Seeded ${items.length} default inventory items successfully`,
    data: items,
  });
});

module.exports = {
  listInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  toggleInventoryItemStatus,
  deleteInventoryItem,
  seedDefaultInventoryItems,
};