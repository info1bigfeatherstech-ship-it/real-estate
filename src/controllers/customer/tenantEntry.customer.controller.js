const tenantEntryService = require('../../services/customer/tenantEntry.customer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── List Tenant Entries ──────────────────────────────────────────────────
const listTenantEntries = asyncHandler(async (req, res) => {
  const result = await tenantEntryService.listTenantEntries(req.customer._id, req.query);
  return ApiResponse.success(res, {
    message: 'Tenant entries fetched successfully',
    data: result.entries,
    meta: result.meta,
  });
});

// ─── Get Single Tenant Entry ──────────────────────────────────────────────
const getTenantEntry = asyncHandler(async (req, res) => {
  const entry = await tenantEntryService.getTenantEntryById(req.customer._id, req.params.id);
  return ApiResponse.success(res, {
    message: 'Tenant entry fetched successfully',
    data: entry,
  });
});

// ─── Get Tenant Entries by Property ──────────────────────────────────────
const getTenantEntriesByProperty = asyncHandler(async (req, res) => {
  const entries = await tenantEntryService.getTenantEntriesByProperty(
    req.customer._id,
    req.params.propertyId
  );
  return ApiResponse.success(res, {
    message: 'Tenant entries fetched successfully',
    data: entries,
  });
});

// ─── Create Tenant Entry ──────────────────────────────────────────────────
const createTenantEntry = asyncHandler(async (req, res) => {
  // Only owners can create tenant entries
  if (!['owner'].includes(req.customer.accountType)) {
    throw AppError.forbidden('Only property owners can manage tenants');
  }

  const entry = await tenantEntryService.createTenantEntry(req.customer._id, req.body);
  return ApiResponse.created(res, 'Tenant entry created successfully', entry);
});

// ─── Update Tenant Entry ──────────────────────────────────────────────────
const updateTenantEntry = asyncHandler(async (req, res) => {
  const entry = await tenantEntryService.updateTenantEntry(
    req.customer._id,
    req.params.id,
    req.body
  );
  return ApiResponse.success(res, {
    message: 'Tenant entry updated successfully',
    data: entry,
  });
});

// ─── Delete Tenant Entry ──────────────────────────────────────────────────
const deleteTenantEntry = asyncHandler(async (req, res) => {
  await tenantEntryService.deleteTenantEntry(req.customer._id, req.params.id);
  return ApiResponse.success(res, {
    message: 'Tenant entry deleted successfully',
  });
});

// ─── Get Tenant Summary ──────────────────────────────────────────────────
const getTenantSummary = asyncHandler(async (req, res) => {
  const summary = await tenantEntryService.getTenantSummary(req.customer._id);
  return ApiResponse.success(res, {
    message: 'Tenant summary fetched successfully',
    data: summary,
  });
});

module.exports = {
  listTenantEntries,
  getTenantEntry,
  getTenantEntriesByProperty,
  createTenantEntry,
  updateTenantEntry,
  deleteTenantEntry,
  getTenantSummary,
};