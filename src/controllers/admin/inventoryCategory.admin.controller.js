const categoryService = require('../../services/admin/inventoryCategory.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

const listCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.listCategories(req.query);
  return ApiResponse.success(res, {
    message: 'Categories fetched successfully',
    data: result.categories,
    meta: result.meta,
  });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Category fetched successfully',
    data: category,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.user._id);
  return ApiResponse.created(res, 'Category created successfully', category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
    req.user._id
  );
  return ApiResponse.success(res, {
    message: 'Category updated successfully',
    data: category,
  });
});

const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const category = await categoryService.toggleCategoryStatus(
    req.params.id,
    isActive,
    req.user._id
  );
  return ApiResponse.success(res, {
    message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  return ApiResponse.success(res, {
    message: 'Category deleted successfully',
  });
});

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
};