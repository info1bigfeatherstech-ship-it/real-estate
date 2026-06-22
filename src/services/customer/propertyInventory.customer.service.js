const PropertyInventory = require('../../models/PropertyInventory.model');
const Property = require('../../models/Property.model');
const InventoryItem = require('../../models/InventoryItem.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { escapeRegex } = require('../../utils/regex');

// ─── Populate Fields ──────────────────────────────────────────────────────
const populateFields = [
  { path: 'propertyId', select: 'title listingType location.city' },
  { path: 'createdBy', select: 'fullName email mobile accountType' },
  { path: 'items.masterItemId', select: 'name category' },
];

// ─── Get Property Inventory by Property ID ────────────────────────────────
const getInventoryByPropertyId = async (propertyId, customerId) => {
  // Check if property exists and belongs to customer
  const property = await Property.findOne({
    _id: propertyId,
    createdBy: customerId,
    isDeleted: false,
  });

  if (!property) {
    throw AppError.notFound('Property not found or you do not have access');
  }

  const inventory = await PropertyInventory.findOne({
    propertyId,
    isDeleted: false,
  }).populate(populateFields);

  return inventory;
};

// ─── Get Inventory Item by ID ──────────────────────────────────────────────
const getInventoryItemById = async (inventoryId, customerId) => {
  const inventory = await PropertyInventory.findOne({
    _id: inventoryId,
    isDeleted: false,
    createdBy: customerId,
  }).populate(populateFields);

  if (!inventory) {
    throw AppError.notFound('Inventory not found or you do not have access');
  }

  return inventory;
};

// ─── Create or Update Property Inventory ───────────────────────────────────
const upsertPropertyInventory = async (customerId, data) => {
  const { propertyId, items } = data;

  // Check if property exists and belongs to customer
  const property = await Property.findOne({
    _id: propertyId,
    createdBy: customerId,
    isDeleted: false,
  });

  if (!property) {
    throw AppError.notFound('Property not found or you do not have access');
  }

  // Validate all master items exist
  for (const item of items) {
    const masterItem = await InventoryItem.findOne({
      _id: item.masterItemId,
      isDeleted: false,
    });
    if (!masterItem) {
      throw AppError.notFound(`Master item "${item.name}" not found`);
    }
  }

  // Calculate quantities
  const processedItems = items.map((item) => ({
    ...item,
    availableQuantity: item.totalQuantity - item.inUseQuantity,
  }));

  // Find existing inventory
  const existingInventory = await PropertyInventory.findOne({
    propertyId,
    isDeleted: false,
  });

  let inventory;
  if (existingInventory) {
    // Update existing inventory
    existingInventory.items = processedItems;
    existingInventory.lastUpdatedBy = customerId;
    await existingInventory.save();
    inventory = existingInventory;
  } else {
    // Create new inventory
    inventory = await PropertyInventory.create({
      propertyId,
      items: processedItems,
      createdBy: customerId,
      lastUpdatedBy: customerId,
    });
  }

  return inventory.populate(populateFields);
};

// ─── Update Single Inventory Item ──────────────────────────────────────────
const updateInventoryItem = async (
  customerId,
  inventoryId,
  itemId,
  updates
) => {
  const inventory = await PropertyInventory.findOne({
    _id: inventoryId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!inventory) {
    throw AppError.notFound('Inventory not found or you do not have access');
  }

  const itemIndex = inventory.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    throw AppError.notFound('Inventory item not found');
  }

  const item = inventory.items[itemIndex];

  // Update fields
  if (updates.totalQuantity !== undefined) {
    item.totalQuantity = updates.totalQuantity;
  }
  if (updates.availableQuantity !== undefined) {
    item.availableQuantity = updates.availableQuantity;
  }
  if (updates.inUseQuantity !== undefined) {
    item.inUseQuantity = updates.inUseQuantity;
  }
  if (updates.condition !== undefined) {
    item.condition = updates.condition;
  }
  if (updates.remarks !== undefined) {
    item.remarks = updates.remarks;
  }

  // Recalculate availableQuantity if total or inUse changed
  if (
    updates.totalQuantity !== undefined ||
    updates.inUseQuantity !== undefined
  ) {
    item.availableQuantity = item.totalQuantity - item.inUseQuantity;
  }

  inventory.lastUpdatedBy = customerId;
  await inventory.save();

  return inventory.populate(populateFields);
};

// ─── Delete Single Inventory Item ──────────────────────────────────────────
const deleteInventoryItem = async (customerId, inventoryId, itemId) => {
  const inventory = await PropertyInventory.findOne({
    _id: inventoryId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!inventory) {
    throw AppError.notFound('Inventory not found or you do not have access');
  }

  const itemIndex = inventory.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    throw AppError.notFound('Inventory item not found');
  }

  // Check if item is in use
  const item = inventory.items[itemIndex];
  if (item.inUseQuantity > 0) {
    throw AppError.badRequest(
      `Cannot delete item "${item.name}" because ${item.inUseQuantity} units are currently in use`
    );
  }

  inventory.items.splice(itemIndex, 1);
  inventory.lastUpdatedBy = customerId;
  await inventory.save();

  return inventory.populate(populateFields);
};

// ─── Delete Entire Property Inventory ──────────────────────────────────────
const deletePropertyInventory = async (customerId, inventoryId) => {
  const inventory = await PropertyInventory.findOne({
    _id: inventoryId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!inventory) {
    throw AppError.notFound('Inventory not found or you do not have access');
  }

  // Check if any items are in use
  const inUseItems = inventory.items.filter((item) => item.inUseQuantity > 0);
  if (inUseItems.length > 0) {
    throw AppError.badRequest(
      `Cannot delete inventory because ${inUseItems.length} items are currently in use`
    );
  }

  inventory.isDeleted = true;
  inventory.deletedAt = new Date();
  await inventory.save();

  return inventory;
};

// ─── Get Inventory Summary for Dashboard ──────────────────────────────────
const getInventorySummary = async (customerId) => {
  const inventories = await PropertyInventory.find({
    createdBy: customerId,
    isDeleted: false,
  }).populate('propertyId', 'title listingType location.city');

  let totalItems = 0;
  let totalAvailable = 0;
  let totalInUse = 0;

  inventories.forEach((inv) => {
    inv.items.forEach((item) => {
      totalItems += item.totalQuantity;
      totalAvailable += item.availableQuantity;
      totalInUse += item.inUseQuantity;
    });
  });

  return {
    totalInventories: inventories.length,
    totalItems,
    totalAvailable,
    totalInUse,
    inventories,
  };
};

module.exports = {
  getInventoryByPropertyId,
  getInventoryItemById,
  upsertPropertyInventory,
  updateInventoryItem,
  deleteInventoryItem,
  deletePropertyInventory,
  getInventorySummary,
};