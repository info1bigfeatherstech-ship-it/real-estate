// src/routes/admin/inventoryCategory.admin.routes.js
const express = require('express');
const categoryController = require('../../controllers/admin/inventoryCategory.admin.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

/**
 * GET /api/v1/admin/inventory-categories
 * List all categories
 */
router.get('/', categoryController.listCategories);

/**
 * POST /api/v1/admin/inventory-categories
 * Create new category
 * Body: { "name": "Electronics", "description": "..." }
 */
router.post('/', categoryController.createCategory);

/**
 * GET /api/v1/admin/inventory-categories/:id
 * Get single category
 */
router.get('/:id', categoryController.getCategory);

/**
 * PUT /api/v1/admin/inventory-categories/:id
 * Update category
 * Body: { "name": "New Name", "description": "..." }
 */
router.put('/:id', categoryController.updateCategory);

/**
 * PATCH /api/v1/admin/inventory-categories/:id/status
 * Toggle category status
 * Body: { "isActive": false }
 */
router.patch('/:id/status', categoryController.toggleCategoryStatus);

/**
 * DELETE /api/v1/admin/inventory-categories/:id
 * Delete category
 */
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;