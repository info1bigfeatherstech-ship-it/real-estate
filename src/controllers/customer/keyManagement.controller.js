const keyManagementService = require('../../services/customer/keyManagement.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');

// ─── List Keys ─────────────────────────────────────────────────────────────
const listKeys = asyncHandler(async (req, res) => {
  const result = await keyManagementService.listKeys(req.customer._id, req.query);
  return ApiResponse.success(res, {
    message: 'Keys fetched successfully',
    data: result.keys,
    meta: result.meta,
  });
});

// ─── Get Key by ID ─────────────────────────────────────────────────────────
const getKey = asyncHandler(async (req, res) => {
  const key = await keyManagementService.getKeyById(req.customer._id, req.params.id);
  return ApiResponse.success(res, {
    message: 'Key fetched successfully',
    data: key,
  });
});

// ─── Get Property Keys ────────────────────────────────────────────────────
const getPropertyKeys = asyncHandler(async (req, res) => {
  const keys = await keyManagementService.getPropertyKeys(
    req.customer._id,
    req.params.propertyId
  );
  return ApiResponse.success(res, {
    message: 'Property keys fetched successfully',
    data: keys,
  });
});

// ─── Get Keys by Holder ───────────────────────────────────────────────────
const getKeysByHolder = asyncHandler(async (req, res) => {
  const keys = await keyManagementService.getKeysByHolder(
    req.customer._id,
    req.params.holderId
  );
  return ApiResponse.success(res, {
    message: 'Holder keys fetched successfully',
    data: keys,
  });
});

// ─── Create Key ────────────────────────────────────────────────────────────
const createKey = asyncHandler(async (req, res) => {
  // Only owners and managers can create keys
  if (!['owner', 'agent'].includes(req.customer.accountType)) {
    throw AppError.forbidden('Only property owners and agents can manage keys');
  }

  const key = await keyManagementService.createKey(req.customer._id, req.body);
  return ApiResponse.created(res, 'Key created successfully', key);
});

// ─── Move Key ─────────────────────────────────────────────────────────────
const moveKey = asyncHandler(async (req, res) => {
  const key = await keyManagementService.moveKey(
    req.customer._id,
    req.params.id,
    req.body
  );
  return ApiResponse.success(res, {
    message: 'Key moved successfully',
    data: key,
  });
});

// ─── Return Key ────────────────────────────────────────────────────────────
const returnKey = asyncHandler(async (req, res) => {
  const key = await keyManagementService.returnKey(
    req.customer._id,
    req.params.id,
    req.body
  );
  return ApiResponse.success(res, {
    message: 'Key returned successfully',
    data: key,
  });
});

// ─── Update Key Status ────────────────────────────────────────────────────
const updateKeyStatus = asyncHandler(async (req, res) => {
  const key = await keyManagementService.updateKeyStatus(
    req.customer._id,
    req.params.id,
    req.body
  );
  return ApiResponse.success(res, {
    message: 'Key status updated successfully',
    data: key,
  });
});

// ─── Delete Key ────────────────────────────────────────────────────────────
const deleteKey = asyncHandler(async (req, res) => {
  await keyManagementService.deleteKey(req.customer._id, req.params.id);
  return ApiResponse.success(res, {
    message: 'Key deleted successfully',
  });
});

// ─── Get Key History ──────────────────────────────────────────────────────
const getKeyHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const result = await keyManagementService.getKeyHistory(
    req.customer._id,
    id,
    { page: parseInt(page), limit: parseInt(limit) }
  );

  return ApiResponse.success(res, {
    message: 'Key history fetched successfully',
    data: result.movements,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

// ─── Get Key Summary ──────────────────────────────────────────────────────
const getKeySummary = asyncHandler(async (req, res) => {
  const summary = await keyManagementService.getKeySummary(req.customer._id);
  return ApiResponse.success(res, {
    message: 'Key summary fetched successfully',
    data: summary,
  });
});

module.exports = {
  listKeys,
  getKey,
  getPropertyKeys,
  getKeysByHolder,
  createKey,
  moveKey,
  returnKey,
  updateKeyStatus,
  deleteKey,
  getKeyHistory,
  getKeySummary,
};