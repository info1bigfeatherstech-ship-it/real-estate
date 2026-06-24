const InventoryCategory = require('../../models/InventoryCategory.model'); // ← ✅ ADD THIS
const InventoryItem = require('../../models/InventoryItem.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { DEFAULT_INVENTORY_ITEMS } = require('../../constants/tenantEnums');

// ─── Populate Fields ──────────────────────────────────────────────────────
const populateFields = [
  { path: 'createdBy', select: 'name email role' },
   { path: 'categoryId', select: 'name description' },
];

// ─── Escape Regex ─────────────────────────────────────────────────────────
const escapeRegex = (value) => {
  if (!value) return '';
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// ─── Build List Filter ────────────────────────────────────────────────────
const buildListFilter = ({ search, categoryId, isActive }) => {
  const filter = { isDeleted: false };

  // ✅ FIX: category → categoryId
  if (categoryId) filter.categoryId = categoryId;
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }];
  }

  return filter;
};

// ─── List Inventory Items ─────────────────────────────────────────────────
const listInventoryItems = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(query);
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    InventoryItem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateFields)
      .lean(),
    InventoryItem.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

// ─── Get Inventory Item by ID ─────────────────────────────────────────────
const getInventoryItemById = async (itemId) => {
  const item = await InventoryItem.findOne({
    _id: itemId,
    isDeleted: false,
  }).populate(populateFields);

  if (!item) throw AppError.notFound('Inventory item not found');
  return item;
};

// ─── Get Inventory Item by Name ───────────────────────────────────────────
const getInventoryItemByName = async (name) => {
  return InventoryItem.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
    isDeleted: false,
  });
};

// ─── Create Inventory Item ────────────────────────────────────────────────
const createInventoryItem = async (data, userId) => {
  // ✅ Validate that category exists
  const category = await InventoryCategory.findOne({
    _id: data.categoryId,
    isDeleted: false,
    isActive: true,
  });

  if (!category) {
    throw AppError.badRequest('Invalid category. Please select a valid category.');
  }

  const existing = await getInventoryItemByName(data.name);
  if (existing) {
    throw AppError.conflict(`Inventory item "${data.name}" already exists`);
  }

  const item = await InventoryItem.create({
    name: data.name.trim(),
    categoryId: data.categoryId,
    categoryName: category.name,
    isActive: true,
    createdBy: userId,
  });

  return InventoryItem.findById(item._id).populate(populateFields);
};

// ─── Update Inventory Item ────────────────────────────────────────────────
const updateInventoryItem = async (itemId, data, userId) => {
  const item = await InventoryItem.findOne({
    _id: itemId,
    isDeleted: false,
  });

  if (!item) throw AppError.notFound('Inventory item not found');

  if (data.name && data.name !== item.name) {
    const existing = await getInventoryItemByName(data.name);
    if (existing) {
      throw AppError.conflict(`Inventory item "${data.name}" already exists`);
    }
    item.name = data.name.trim();
  }

  // ✅ FIX: Handle categoryId update
  if (data.categoryId !== undefined) {
    const category = await InventoryCategory.findOne({
      _id: data.categoryId,
      isDeleted: false,
      isActive: true,
    });
    if (!category) {
      throw AppError.badRequest('Invalid category. Please select a valid category.');
    }
    item.categoryId = data.categoryId;
    item.categoryName = category.name;
  }

  if (data.isActive !== undefined) {
    item.isActive = data.isActive;
  }

  await item.save();
  return InventoryItem.findById(item._id).populate(populateFields);
};

// ─── Toggle Inventory Item Status ────────────────────────────────────────
const toggleInventoryItemStatus = async (itemId, isActive, userId) => {
  const item = await InventoryItem.findOne({
    _id: itemId,
    isDeleted: false,
  });

  if (!item) throw AppError.notFound('Inventory item not found');

  item.isActive = isActive;
  await item.save();

  return InventoryItem.findById(item._id).populate(populateFields);
};

// ─── Delete Inventory Item (Soft Delete) ─────────────────────────────────
const deleteInventoryItem = async (itemId) => {
  const item = await InventoryItem.findOne({
    _id: itemId,
    isDeleted: false,
  });

  if (!item) throw AppError.notFound('Inventory item not found');

  item.isDeleted = true;
  item.deletedAt = new Date();
  item.isActive = false;
  await item.save();

  return item;
};

// ─── Seed Default Inventory Items ────────────────────────────────────────
const seedDefaultInventoryItems = async (userId) => {
  const results = [];
  for (const defaultItem of DEFAULT_INVENTORY_ITEMS) {
    const existing = await getInventoryItemByName(defaultItem.name);
    if (!existing) {
      // ✅ FIX: Find category by name
      const category = await InventoryCategory.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(defaultItem.category)}$`, 'i') },
        isDeleted: false,
      });

      if (!category) {
        console.warn(`Category "${defaultItem.category}" not found. Skipping item "${defaultItem.name}".`);
        continue;
      }

      const item = await InventoryItem.create({
        name: defaultItem.name,
        categoryId: category._id,
        categoryName: category.name,
        isActive: true,
        createdBy: userId,
      });
      results.push(item);
    }
  }
  return results;
};

// ─── ✅ EXPORT ALL FUNCTIONS ──────────────────────────────────────────────
module.exports = {
  listInventoryItems,
  getInventoryItemById,
  getInventoryItemByName,
  createInventoryItem,
  updateInventoryItem,
  toggleInventoryItemStatus,
  deleteInventoryItem,
  seedDefaultInventoryItems,
};