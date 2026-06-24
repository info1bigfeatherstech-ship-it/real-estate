const EliteService = require('../../models/EliteService.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

// ─── Populate Fields ──────────────────────────────────────────────────────
const populateFields = [
  { path: 'createdBy', select: 'name email role' },
  { path: 'lastUpdatedBy', select: 'name email role' },
];

// ─── Escape Regex ─────────────────────────────────────────────────────────
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ─── Build List Filter ────────────────────────────────────────────────────
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

// ─── List Elite Services ──────────────────────────────────────────────────
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

// ─── Get Elite Service Stats ──────────────────────────────────────────────
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

// ─── Get Elite Service by ID ──────────────────────────────────────────────
const getEliteServiceById = async (serviceId) => {
  const service = await EliteService.findOne({ _id: serviceId, isDeleted: false }).populate(populateFields);

  if (!service) throw AppError.notFound('Elite service provider not found');
  return service;
};

// ─── Create Elite Service ─────────────────────────────────────────────────
const createEliteService = async (data, userId) => {
  const service = await EliteService.create({
    ...data,
    secondaryMobile: data.secondaryMobile || null,
    createdBy: userId,
    lastUpdatedBy: userId,
  });

  return EliteService.findById(service._id).populate(populateFields);
};

// ─── Update Elite Service ─────────────────────────────────────────────────
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

// ─── Update Elite Service Status ──────────────────────────────────────────
const updateEliteServiceStatus = async (serviceId, status, userId) => {
  const service = await EliteService.findOneAndUpdate(
    { _id: serviceId, isDeleted: false },
    { status, lastUpdatedBy: userId },
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (!service) throw AppError.notFound('Elite service provider not found');
  return service;
};

// ─── Delete Elite Service ──────────────────────────────────────────────────
const deleteEliteService = async (serviceId, userId) => {
  const service = await EliteService.findOne({ _id: serviceId, isDeleted: false });

  if (!service) throw AppError.notFound('Elite service provider not found');

  service.isDeleted = true;
  service.deletedAt = new Date();
  service.lastUpdatedBy = userId;

  await service.save();
  return service;
};

// ─── List Available Roles (For Public API) ────────────────────────────────
const listAvailableRoles = async () => {
  // This will be dynamic when we add EliteServiceConfig
  // For now, return distinct roles from existing services
  const roles = await EliteService.distinct('role', { isDeleted: false });
  return roles.sort();
};

// ─── ✅ EXPORT ALL FUNCTIONS ──────────────────────────────────────────────
module.exports = {
  listEliteServices,
  getEliteServiceStats,
  getEliteServiceById,
  createEliteService,
  updateEliteService,
  updateEliteServiceStatus,
  deleteEliteService,
  listAvailableRoles,
};