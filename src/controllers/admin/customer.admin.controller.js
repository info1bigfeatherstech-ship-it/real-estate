const customerService = require('../../services/admin/customer.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getCustomerStats = asyncHandler(async (_req, res) => {
  const stats = await customerService.getCustomerStats();
  return ApiResponse.success(res, { message: 'Customer stats fetched', data: stats });
});

const listCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.listCustomers(req.query);
  return ApiResponse.success(res, {
    message: 'Customers fetched successfully',
    data: result.customers,
    meta: result.meta,
  });
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);
  return ApiResponse.success(res, { message: 'Customer fetched successfully', data: customer });
});

const updateCustomerStatus = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomerStatus(req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Customer updated successfully', data: customer });
});

module.exports = {
  getCustomerStats,
  listCustomers,
  getCustomer,
  updateCustomerStatus,
};
