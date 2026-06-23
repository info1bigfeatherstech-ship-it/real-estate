const tenantExitService = require('../../services/customer/tenantExit.customer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── List Tenant Exits ────────────────────────────────────────────────────
const listTenantExits = asyncHandler(async (req, res) => {
  const result = await tenantExitService.listTenantExits(req.customer._id, req.query);
  return ApiResponse.success(res, {
    message: 'Tenant exits fetched successfully',
    data: result.exits,
    meta: result.meta,
  });
});

// ─── Get Single Tenant Exit ──────────────────────────────────────────────
const getTenantExit = asyncHandler(async (req, res) => {
  const exit = await tenantExitService.getTenantExitById(req.customer._id, req.params.id);
  return ApiResponse.success(res, {
    message: 'Tenant exit fetched successfully',
    data: exit,
  });
});

// ─── Get Tenant Exit by Entry Record ────────────────────────────────────
const getTenantExitByEntry = asyncHandler(async (req, res) => {
  const exit = await tenantExitService.getTenantExitByEntry(
    req.customer._id,
    req.params.entryId
  );
  return ApiResponse.success(res, {
    message: 'Tenant exit fetched successfully',
    data: exit,
  });
});

// ─── Get Entry for Auto-fill ─────────────────────────────────────────────
const getEntryForExit = asyncHandler(async (req, res) => {
  const entry = await tenantExitService.getEntryForExit(
    req.customer._id,
    req.params.entryId
  );
  return ApiResponse.success(res, {
    message: 'Entry record fetched for exit',
    data: entry,
  });
});

// ─── Create Tenant Exit ──────────────────────────────────────────────────
const createTenantExit = asyncHandler(async (req, res) => {
  // Only owners can create tenant exits
  if (!['owner'].includes(req.customer.accountType)) {
    throw AppError.forbidden('Only property owners can manage tenant exits');
  }

  const exit = await tenantExitService.createTenantExit(req.customer._id, req.body);
  return ApiResponse.created(res, 'Tenant exit created successfully', exit);
});

// ─── Update Tenant Exit ──────────────────────────────────────────────────
const updateTenantExit = asyncHandler(async (req, res) => {
  const exit = await tenantExitService.updateTenantExit(
    req.customer._id,
    req.params.id,
    req.body
  );
  return ApiResponse.success(res, {
    message: 'Tenant exit updated successfully',
    data: exit,
  });
});

// ─── Delete Tenant Exit ──────────────────────────────────────────────────
const deleteTenantExit = asyncHandler(async (req, res) => {
  await tenantExitService.deleteTenantExit(req.customer._id, req.params.id);
  return ApiResponse.success(res, {
    message: 'Tenant exit deleted successfully',
  });
});

// ─── Get Tenant Exit Summary ────────────────────────────────────────────
const getTenantExitSummary = asyncHandler(async (req, res) => {
  const summary = await tenantExitService.getTenantExitSummary(req.customer._id);
  return ApiResponse.success(res, {
    message: 'Tenant exit summary fetched successfully',
    data: summary,
  });
});

module.exports = {
  listTenantExits,
  getTenantExit,
  getTenantExitByEntry,
  getEntryForExit,
  createTenantExit,
  updateTenantExit,
  deleteTenantExit,
  getTenantExitSummary,
};