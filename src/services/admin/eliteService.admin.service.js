const EliteService = require('../../models/EliteService.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

const populateFields = [
  { path: 'createdBy', select: 'name email role' },
  { path: 'lastUpdatedBy', select: 'name email role' },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildListFilter = ({ search, role, status }) => {
  const filter = { isDeleted: false };

  if (role) filter.role = role;
  if (status) filter.status = status;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { providerName: pattern },
      { address: pattern },
      { primaryMobile: pattern },
      { secondaryMobile: pattern },
    ];
  }

  return filter;
};

const listEliteServices = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(query);
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [services, total] = await Promise.all([
    EliteService.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateFields)
      .lean(),
    EliteService.countDocuments(filter),
  ]);

  return {
    services,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getEliteServiceStats = async () => {
  const baseFilter = { isDeleted: false };

  const [total, available, busy, rolesAvailable] = await Promise.all([
    EliteService.countDocuments(baseFilter),
    EliteService.countDocuments({ ...baseFilter, status: 'Available' }),
    EliteService.countDocuments({ ...baseFilter, status: 'Busy' }),
    EliteService.distinct('role', baseFilter),
  ]);

  return {
    totalProviders: total,
    available,
    busy,
    rolesAvailable: rolesAvailable.length,
    rolesBreakdown: rolesAvailable.sort(),
  };
};

const getEliteServiceById = async (serviceId) => {
  const service = await EliteService.findOne({ _id: serviceId, isDeleted: false }).populate(populateFields);

  if (!service) throw AppError.notFound('Elite service provider not found');
  return service;
};

const createEliteService = async (data, userId) => {
  const service = await EliteService.create({
    ...data,
    secondaryMobile: data.secondaryMobile || null,
    createdBy: userId,
    lastUpdatedBy: userId,
  });

  return EliteService.findById(service._id).populate(populateFields);
};

const updateEliteService = async (serviceId, data, userId) => {
  const updatePayload = { ...data, lastUpdatedBy: userId };

  if (Object.prototype.hasOwnProperty.call(data, 'secondaryMobile')) {
    updatePayload.secondaryMobile = data.secondaryMobile || null;
  }

  const service = await EliteService.findOneAndUpdate(
    { _id: serviceId, isDeleted: false },
    updatePayload,
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!service) throw AppError.notFound('Elite service provider not found');
  return service;
};

const updateEliteServiceStatus = async (serviceId, status, userId) => {
  const service = await EliteService.findOneAndUpdate(
    { _id: serviceId, isDeleted: false },
    { status, lastUpdatedBy: userId },
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!service) throw AppError.notFound('Elite service provider not found');
  return service;
};

const deleteEliteService = async (serviceId, userId) => {
  const service = await EliteService.findOne({ _id: serviceId, isDeleted: false });

  if (!service) throw AppError.notFound('Elite service provider not found');

  service.isDeleted = true;
  service.deletedAt = new Date();
  service.lastUpdatedBy = userId;

  await service.save();
  return service;
};

module.exports = {
  listEliteServices,
  getEliteServiceStats,
  getEliteServiceById,
  createEliteService,
  updateEliteService,
  updateEliteServiceStatus,
  deleteEliteService,
};
