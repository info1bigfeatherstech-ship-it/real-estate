const InventoryCategory = require('../models/InventoryCategory.model');
const { DEFAULT_CATEGORIES } = require('../constants/inventoryEnums');

const seedDefaultCategories = async (userId) => {
  const results = [];
  for (const categoryName of DEFAULT_CATEGORIES) {
    const existing = await InventoryCategory.findOne({
      name: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      isDeleted: false,
    });

    if (!existing) {
      const category = await InventoryCategory.create({
        name: categoryName,
        description: `Default ${categoryName} category`,
        isActive: true,
        isDefault: true,
        createdBy: userId,
      });
      results.push(category);
    }
  }
  return results;
};

module.exports = { seedDefaultCategories };