const EliteService = require('../../models/EliteService.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { toPublicEliteService } = require('../../mappers/eliteService.public.mapper');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const PUBLIC_PROJECTION = {
  role: 1,
  providerName: 1,
  address: 1,
  primaryMobile: 1,
  secondaryMobile: 1,
  status: 1,
  createdAt: 1,
  updatedAt: 1,
};

const buildPublicFilter = ({ search, role, status }) => {
  const filter = { isDeleted: false };

  if (role) filter.role = role;
  if (status) filter.status = status;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { providerName: pattern },
      { address: pattern },
      { role: pattern },
      { primaryMobile: pattern },
      { secondaryMobile: pattern },
    ];
  }

  return filter;
};

const buildPublicSort = (sortBy, sortOrder) => {
  const direction = sortOrder === 'desc' ? -1 : 1;
  const sortFieldMap = {
    providerName: 'providerName',
    role: 'role',
    status: 'status',
    createdAt: 'createdAt',
  };
  return { [sortFieldMap[sortBy]]: direction };
};

const listEliteServices = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildPublicFilter(query);
  const sort = buildPublicSort(query.sortBy, query.sortOrder);

  const [services, total] = await Promise.all([
    EliteService.find(filter)
      .select(PUBLIC_PROJECTION)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    EliteService.countDocuments(filter),
  ]);

  return {
    services: services.map(toPublicEliteService),
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getEliteServiceById = async (serviceId) => {
  const service = await EliteService.findOne({ _id: serviceId, isDeleted: false })
    .select(PUBLIC_PROJECTION)
    .lean();

  if (!service) throw AppError.notFound('Elite service provider not found');
  return toPublicEliteService(service);
};

const listAvailableRoles = async () => {
  const roles = await EliteService.distinct('role', { isDeleted: false });
  return roles.sort();
};

module.exports = {
  listEliteServices,
  getEliteServiceById,
  listAvailableRoles,
};
