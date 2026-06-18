const Customer = require('../../models/Customer.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { CUSTOMER_ACCOUNT_TYPES } = require('../../constants/customerAccountTypes');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildListFilter = ({ search, accountType, isActive, emailVerified }) => {
  const filter = {};

  if (accountType) filter.accountType = accountType;
  if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true' || isActive === true;
  if (emailVerified !== undefined && emailVerified !== '') {
    filter.emailVerified = emailVerified === 'true' || emailVerified === true;
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ fullName: pattern }, { email: pattern }, { mobile: pattern }];
  }

  return filter;
};

const listCustomers = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(query);
  const sort = { [query.sortBy || 'createdAt']: query.sortOrder === 'asc' ? 1 : -1 };

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);

  return {
    customers,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getCustomerStats = async () => {
  const [total, accountGroups, verifiedCount] = await Promise.all([
    Customer.countDocuments({}),
    Customer.aggregate([{ $group: { _id: '$accountType', count: { $sum: 1 } } }]),
    Customer.countDocuments({ emailVerified: true, isActive: true }),
  ]);

  return {
    totalCustomers: total,
    verifiedActive: verifiedCount,
    accountTypeBreakdown: accountGroups.map((item) => ({
      accountType: item._id,
      count: item.count,
    })),
    accountTypes: CUSTOMER_ACCOUNT_TYPES,
  };
};

const getCustomerById = async (customerId) => {
  const customer = await Customer.findById(customerId).lean();
  if (!customer) throw AppError.notFound('Customer not found');
  return customer;
};

const updateCustomerStatus = async (customerId, { isActive }) => {
  const customer = await Customer.findByIdAndUpdate(
    customerId,
    { isActive },
    { new: true, runValidators: true }
  ).lean();

  if (!customer) throw AppError.notFound('Customer not found');
  return customer;
};

module.exports = {
  listCustomers,
  getCustomerStats,
  getCustomerById,
  updateCustomerStatus,
};
