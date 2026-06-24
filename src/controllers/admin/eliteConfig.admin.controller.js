const eliteConfigService = require('../../services/admin/eliteConfig.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── Get all roles ──────────────────────────────────────────────────────────
const getRoles = asyncHandler(async (req, res) => {
  const roles = await eliteConfigService.getRoles();
  return ApiResponse.success(res, {
    message: 'Elite service roles fetched successfully',
    data: { roles },
  });
});

// ─── Add new role ───────────────────────────────────────────────────────────
const addRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const roles = await eliteConfigService.addRole(role, req.user._id);
  return ApiResponse.created(res, {
    message: `Role "${role}" added successfully`,
    data: { roles },
  });
});

// ─── Update role ────────────────────────────────────────────────────────────
const updateRole = asyncHandler(async (req, res) => {
  const { oldRole, newRole } = req.body;
  const roles = await eliteConfigService.updateRole(oldRole, newRole, req.user._id);
  return ApiResponse.success(res, {
    message: `Role "${oldRole}" updated to "${newRole}" successfully`,
    data: { roles },
  });
});

// ─── Delete role ────────────────────────────────────────────────────────────
const deleteRole = asyncHandler(async (req, res) => {
  const { roleName } = req.params;
  const roles = await eliteConfigService.deleteRole(roleName, req.user._id);
  return ApiResponse.success(res, {
    message: `Role "${roleName}" deleted successfully`,
    data: { roles },
  });
});

module.exports = {
  getRoles,
  addRole,
  updateRole,
  deleteRole,
};