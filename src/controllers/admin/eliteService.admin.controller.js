const eliteServiceService = require('../../services/admin/eliteService.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listEliteServices = asyncHandler(async (req, res) => {
  const result = await eliteServiceService.listEliteServices(req.query);
  return ApiResponse.success(res, {
    message: 'Elite service providers fetched successfully',
    data: result.services,
    meta: result.meta,
  });
});

const getEliteServiceStats = asyncHandler(async (req, res) => {
  const stats = await eliteServiceService.getEliteServiceStats();
  return ApiResponse.success(res, {
    message: 'Elite service stats fetched successfully',
    data: stats,
  });
});

const getEliteService = asyncHandler(async (req, res) => {
  const service = await eliteServiceService.getEliteServiceById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Elite service provider fetched successfully',
    data: service,
  });
});

const createEliteService = asyncHandler(async (req, res) => {
  const service = await eliteServiceService.createEliteService(req.body, req.user._id);
  return ApiResponse.created(res, 'Elite service provider created successfully', service);
});

const updateEliteService = asyncHandler(async (req, res) => {
  const service = await eliteServiceService.updateEliteService(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, {
    message: 'Elite service provider updated successfully',
    data: service,
  });
});

const updateEliteServiceStatus = asyncHandler(async (req, res) => {
  const service = await eliteServiceService.updateEliteServiceStatus(
    req.params.id,
    req.body.status,
    req.user._id
  );
  return ApiResponse.success(res, {
    message: 'Elite service provider status updated successfully',
    data: service,
  });
});

const deleteEliteService = asyncHandler(async (req, res) => {
  await eliteServiceService.deleteEliteService(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: 'Elite service provider deleted successfully' });
});

module.exports = {
  listEliteServices,
  getEliteServiceStats,
  getEliteService,
  createEliteService,
  updateEliteService,
  updateEliteServiceStatus,
  deleteEliteService,
};
