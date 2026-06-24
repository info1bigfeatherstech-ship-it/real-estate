const InventoryCategory = require('../../models/InventoryCategory.model');
const InventoryItem = require('../../models/InventoryItem.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { escapeRegex } = require('../../utils/regex');

const populateFields = [{ path: 'createdBy', select: 'name email role' }];

const listCategories = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(query);
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [categories, total] = await Promise.all([
    InventoryCategory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateFields)
      .lean(),
    InventoryCategory.countDocuments(filter),
  ]);

  return {
    categories,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const buildListFilter = ({ search, isActive, isDefault }) => {
  const filter = { isDeleted: false };

  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true' || isActive === true;
  }
  if (isDefault !== undefined && isDefault !== '') {
    filter.isDefault = isDefault === 'true' || isDefault === true;
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { description: pattern }];
  }

  return filter;
};

const getCategoryById = async (categoryId) => {
  const category = await InventoryCategory.findOne({
    _id: categoryId,
    isDeleted: false,
  }).populate(populateFields);

  if (!category) throw AppError.notFound('Category not found');
  return category;
};

const createCategory = async (data, userId) => {
  const existing = await InventoryCategory.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(data.name)}$`, 'i') },
    isDeleted: false,
  });

  if (existing) {
    throw AppError.conflict(`Category "${data.name}" already exists`);
  }

  const category = await InventoryCategory.create({
    name: data.name.trim(),
    description: data.description || null,
    isActive: true,
    isDefault: false,
    createdBy: userId,
  });

  return category.populate(populateFields);
};

const updateCategory = async (categoryId, data, userId) => {
  const category = await InventoryCategory.findOne({
    _id: categoryId,
    isDeleted: false,
  });

  if (!category) throw AppError.notFound('Category not found');

  if (category.isDefault) {
    throw AppError.forbidden('Cannot modify default categories');
  }

  if (data.name && data.name !== category.name) {
    const existing = await InventoryCategory.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(data.name)}$`, 'i') },
      isDeleted: false,
    });
    if (existing) {
      throw AppError.conflict(`Category "${data.name}" already exists`);
    }
    category.name = data.name.trim();
  }

  if (data.description !== undefined) {
    category.description = data.description;
  }

  category.lastUpdatedBy = userId;
  await category.save();

  return category.populate(populateFields);
};

const toggleCategoryStatus = async (categoryId, isActive, userId) => {
  const category = await InventoryCategory.findOne({
    _id: categoryId,
    isDeleted: false,
  });

  if (!category) throw AppError.notFound('Category not found');

  if (category.isDefault) {
    throw AppError.forbidden('Cannot deactivate default categories');
  }

  category.isActive = isActive;
  category.lastUpdatedBy = userId;
  await category.save();

  return category.populate(populateFields);
};

const deleteCategory = async (categoryId) => {
  const category = await InventoryCategory.findOne({
    _id: categoryId,
    isDeleted: false,
  });

  if (!category) throw AppError.notFound('Category not found');

  if (category.isDefault) {
    throw AppError.forbidden('Cannot delete default categories');
  }

  // ✅ Check if any items exist in this category
  const itemsCount = await InventoryItem.countDocuments({
    categoryId: categoryId,
    isDeleted: false,
  });

  if (itemsCount > 0) {
    throw AppError.badRequest(
      `Cannot delete category "${category.name}" because ${itemsCount} items are using it. Please move or delete those items first.`
    );
  }

  category.isDeleted = true;
  category.deletedAt = new Date();
  category.isActive = false;
  await category.save();

  return category;
};

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
};