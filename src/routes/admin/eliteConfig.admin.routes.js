const express = require('express');
const eliteConfigController = require('../../controllers/admin/eliteConfig.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');
const {
  addRoleSchema,
  updateRoleSchema,
  deleteRoleSchema,
} = require('../../validators/admin/eliteConfig.admin.validator');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// ─── Role Management ────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/elite/roles — List all roles
 */
router.get('/roles', eliteConfigController.getRoles);

/**
 * POST /api/v1/admin/elite/roles — Add new role
 * Body: { "role": "AC Repair" }
 */
router.post('/roles', validate(addRoleSchema), eliteConfigController.addRole);

/**
 * PUT /api/v1/admin/elite/roles — Update role
 * Body: { "oldRole": "Painter", "newRole": "Wall Painter" }
 */
router.put('/roles', validate(updateRoleSchema), eliteConfigController.updateRole);

/**
 * DELETE /api/v1/admin/elite/roles/:roleName — Delete role
 */
router.delete('/roles/:roleName', validate(deleteRoleSchema, 'params'), eliteConfigController.deleteRole);

module.exports = router;