const propertyService = require('../../services/user/property.user.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listProperties = asyncHandler(async (req, res) => {
  const result = await propertyService.listProperties(req.query);
  return ApiResponse.success(res, {
    message: 'Properties fetched successfully',
    data: result.properties,
    meta: result.meta,
  });
});

const getPropertyByListingId = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyByListingId(req.params.listingId);
  return ApiResponse.success(res, {
    message: 'Property fetched successfully',
    data: property,
  });
});

const getPropertyById = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Property fetched successfully',
    data: property,
  });
});

const getRelatedProperties = asyncHandler(async (req, res) => {
  const properties = await propertyService.getRelatedProperties(req.params.id, req.query);
  return ApiResponse.success(res, {
    message: 'Related properties fetched successfully',
    data: properties,
  });
});

module.exports = {
  listProperties,
  getPropertyByListingId,
  getPropertyById,
  getRelatedProperties,
};
