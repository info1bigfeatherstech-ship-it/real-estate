const EliteServiceConfig = require('../../models/EliteServiceConfig.model');
const EliteService = require('../../models/EliteService.model');
const AppError = require('../../errors/AppError');

// ─── Get all roles ──────────────────────────────────────────────────────────
const getRoles = async () => {
  const config = await EliteServiceConfig.getConfig();
  return config.roles;
};

// ─── Add new role ───────────────────────────────────────────────────────────
const addRole = async (roleName, userId) => {
  const config = await EliteServiceConfig.getConfig();

  // Check if role already exists (case-insensitive)
  if (config.roles.some((r) => r.toLowerCase() === roleName.trim().toLowerCase())) {
    throw AppError.conflict(`Role "${roleName}" already exists`);
  }

  config.roles.push(roleName.trim());
  config.lastUpdatedBy = userId;
  await config.save();

  return config.roles;
};

// ─── Update role ────────────────────────────────────────────────────────────
const updateRole = async (oldRole, newRole, userId) => {
  const config = await EliteServiceConfig.getConfig();

  if (!config.roles.includes(oldRole)) {
    throw AppError.notFound(`Role "${oldRole}" not found`);
  }

  // Check if newRole already exists (case-insensitive)
  if (config.roles.some((r) => r.toLowerCase() === newRole.trim().toLowerCase())) {
    throw AppError.conflict(`Role "${newRole}" already exists`);
  }

  // Update role in config
  const index = config.roles.indexOf(oldRole);
  config.roles[index] = newRole.trim();
  config.lastUpdatedBy = userId;
  await config.save();

  // ✅ Update all elite services using this role
  await EliteService.updateMany(
    { role: oldRole, isDeleted: false },
    { role: newRole.trim() }
  );

  return config.roles;
};

// ─── Delete role ────────────────────────────────────────────────────────────
const deleteRole = async (roleName, userId) => {
  const config = await EliteServiceConfig.getConfig();

  if (!config.roles.includes(roleName)) {
    throw AppError.notFound(`Role "${roleName}" not found`);
  }

  // ✅ Check if any elite services are using this role
  const servicesCount = await EliteService.countDocuments({
    role: roleName,
    isDeleted: false,
  });

  if (servicesCount > 0) {
    throw AppError.badRequest(
      `Cannot delete role "${roleName}" because ${servicesCount} service(s) are using it. Please update or delete those services first.`
    );
  }

  config.roles = config.roles.filter((r) => r !== roleName);
  config.lastUpdatedBy = userId;
  await config.save();

  return config.roles;
};

module.exports = {
  getRoles,
  addRole,
  updateRole,
  deleteRole,
};