const fomoService = require('../../services/user/fomo.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get FOMO data for a property
 * GET /api/v1/user/properties/:id/fomo
 */
const getPropertyFOMO = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fomo = await fomoService.getPropertyFOMO(id);
  return ApiResponse.success(res, {
    message: 'Property FOMO data fetched successfully',
    data: fomo,
  });
});

/**
 * Get area-wise demand
 * GET /api/v1/user/areas/demand?city=Mumbai&area=Patel Nagar
 */
const getAreaDemand = asyncHandler(async (req, res) => {
  const { city, area, requirementType, limit = 10 } = req.query;

  if (!city) {
    return ApiResponse.badRequest(res, 'City is required');
  }

  const demand = await fomoService.getAreaDemand({
    city,
    area,
    requirementType,
    limit: parseInt(limit),
  });

  return ApiResponse.success(res, {
    message: 'Area demand fetched successfully',
    data: demand,
  });
});

/**
 * Get area demand with FOMO message
 * GET /api/v1/user/areas/fomo?city=Mumbai&area=Patel Nagar
 */
const getAreaDemandFOMO = asyncHandler(async (req, res) => {
  const { city, area } = req.query;

  if (!city) {
    return ApiResponse.badRequest(res, 'City is required');
  }

  const fomo = await fomoService.getAreaDemandFOMO({ city, area });
  return ApiResponse.success(res, {
    message: 'Area FOMO data fetched successfully',
    data: fomo,
  });
});

/**
 * Get trending properties
 * GET /api/v1/user/properties/trending?limit=10&listingType=For Rent
 */
const getTrendingProperties = asyncHandler(async (req, res) => {
  const { limit = 10, listingType } = req.query;

  const trending = await fomoService.getTrendingProperties({
    limit: parseInt(limit),
    listingType,
  });

  return ApiResponse.success(res, {
    message: 'Trending properties fetched successfully',
    data: trending,
  });
});

/**
 * Get property with FOMO data
 * GET /api/v1/user/properties/:id/fomo/detail
 */
const getPropertyWithFOMO = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await fomoService.getPropertyWithFOMO(id);

  return ApiResponse.success(res, {
    message: 'Property with FOMO data fetched successfully',
    data: result,
  });
});

module.exports = {
  getPropertyFOMO,
  getAreaDemand,
  getAreaDemandFOMO,
  getTrendingProperties,
  getPropertyWithFOMO,
};