const eliteServiceService = require('../../services/user/eliteService.user.service');
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

const getEliteServiceById = asyncHandler(async (req, res) => {
  const service = await eliteServiceService.getEliteServiceById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Elite service provider fetched successfully',
    data: service,
  });
});

const listAvailableRoles = asyncHandler(async (_req, res) => {
  const roles = await eliteServiceService.listAvailableRoles();
  return ApiResponse.success(res, {
    message: 'Elite service roles fetched successfully',
    data: roles,
  });
});

module.exports = {
  listEliteServices,
  getEliteServiceById,
  listAvailableRoles,
};
