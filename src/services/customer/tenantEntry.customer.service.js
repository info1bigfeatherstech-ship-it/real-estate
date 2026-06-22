const TenantEntry = require('../../models/TenantEntry.model');
const Property = require('../../models/Property.model');
const PropertyInventory = require('../../models/PropertyInventory.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { escapeRegex } = require('../../utils/regex');

// ─── Populate Fields ──────────────────────────────────────────────────────
const populateFields = [
  { path: 'propertyId', select: 'title listingType location.city' },
  { path: 'createdBy', select: 'fullName email mobile accountType' },
  { path: 'exitRecordId', select: 'exitDate handoverStatus' },
];

// ─── Build List Filter ────────────────────────────────────────────────────
const buildListFilter = (customerId, { search, propertyId, status, occupantType }) => {
  const filter = {
    isDeleted: false,
    createdBy: customerId,
  };

  if (propertyId) filter.propertyId = propertyId;
  if (status) filter.status = status;
  if (occupantType) filter.occupantType = occupantType;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { tenantName: pattern },
      { mobile: pattern },
      { email: pattern },
      { tenantId: pattern },
    ];
  }

  return filter;
};

// ─── Update Inventory on Entry ────────────────────────────────────────────
const updateInventoryOnEntry = async (propertyId, items) => {
  const inventory = await PropertyInventory.findOne({
    propertyId,
    isDeleted: false,
  });

  if (!inventory) {
    throw AppError.badRequest(
      'Property inventory not found. Please set up inventory first.'
    );
  }

  for (const item of items) {
    const inventoryItem = inventory.items.find(
      (i) => i.masterItemId.toString() === item.inventoryItemId.toString()
    );

    if (!inventoryItem) {
      throw AppError.badRequest(
        `Item "${item.name}" not found in property inventory`
      );
    }

    if (inventoryItem.availableQuantity < item.quantity) {
      throw AppError.badRequest(
        `Only ${inventoryItem.availableQuantity} units of "${item.name}" available, but ${item.quantity} requested`
      );
    }

    inventoryItem.availableQuantity -= item.quantity;
    inventoryItem.inUseQuantity += item.quantity;
  }

  inventory.lastUpdatedBy = customerId;
  await inventory.save();

  return inventory;
};

// ─── List Tenant Entries ──────────────────────────────────────────────────
const listTenantEntries = async (customerId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(customerId, query);
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [entries, total] = await Promise.all([
    TenantEntry.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateFields)
      .lean(),
    TenantEntry.countDocuments(filter),
  ]);

  return {
    entries,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

// ─── Get Tenant Entry by ID ──────────────────────────────────────────────
const getTenantEntryById = async (customerId, entryId) => {
  const entry = await TenantEntry.findOne({
    _id: entryId,
    isDeleted: false,
    createdBy: customerId,
  }).populate(populateFields);

  if (!entry) {
    throw AppError.notFound('Tenant entry not found');
  }

  return entry;
};

// ─── Get Tenant Entries by Property ID ──────────────────────────────────
const getTenantEntriesByProperty = async (customerId, propertyId) => {
  // Check if property belongs to customer
  const property = await Property.findOne({
    _id: propertyId,
    createdBy: customerId,
    isDeleted: false,
  });

  if (!property) {
    throw AppError.notFound('Property not found or you do not have access');
  }

  const entries = await TenantEntry.find({
    propertyId,
    isDeleted: false,
    status: 'active',
  })
    .populate(populateFields)
    .sort({ createdAt: -1 })
    .lean();

  return entries;
};

// ─── Create Tenant Entry ──────────────────────────────────────────────────
const createTenantEntry = async (customerId, data) => {
  // Check if property exists and belongs to customer
  const property = await Property.findOne({
    _id: data.propertyId,
    createdBy: customerId,
    isDeleted: false,
  });

  if (!property) {
    throw AppError.notFound('Property not found or you do not have access');
  }

  // Update inventory with furniture and appliances
  const allItems = [...(data.furniture || []), ...(data.appliances || [])];
  
  if (allItems.length > 0) {
    await updateInventoryOnEntry(customerId, data.propertyId, allItems);
  }

  // Create tenant entry
  const entry = await TenantEntry.create({
    ...data,
    createdBy: customerId,
    lastUpdatedBy: customerId,
  });

  return TenantEntry.findById(entry._id).populate(populateFields);
};

// ─── Update Tenant Entry ──────────────────────────────────────────────────
const updateTenantEntry = async (customerId, entryId, updates) => {
  const entry = await TenantEntry.findOne({
    _id: entryId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!entry) {
    throw AppError.notFound('Tenant entry not found');
  }

  // If status is being updated to 'completed', check if exit record exists
  if (updates.status === 'completed' && !entry.exitRecordId) {
    throw AppError.badRequest(
      'Cannot mark as completed without exit record. Please create exit record first.'
    );
  }

  const updated = await TenantEntry.findOneAndUpdate(
    { _id: entryId, isDeleted: false, createdBy: customerId },
    { ...updates, lastUpdatedBy: customerId },
    { new: true, runValidators: true }
  ).populate(populateFields);

  return updated;
};

// ─── Delete Tenant Entry ──────────────────────────────────────────────────
const deleteTenantEntry = async (customerId, entryId) => {
  const entry = await TenantEntry.findOne({
    _id: entryId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!entry) {
    throw AppError.notFound('Tenant entry not found');
  }

  // If entry has exit record, don't allow deletion
  if (entry.exitRecordId) {
    throw AppError.badRequest(
      'Cannot delete entry with exit record. Please delete exit record first.'
    );
  }

  // Restore inventory quantities
  const allItems = [...(entry.furniture || []), ...(entry.appliances || [])];
  if (allItems.length > 0) {
    const inventory = await PropertyInventory.findOne({
      propertyId: entry.propertyId,
      isDeleted: false,
    });

    if (inventory) {
      for (const item of allItems) {
        const inventoryItem = inventory.items.find(
          (i) => i.masterItemId.toString() === item.inventoryItemId.toString()
        );
        if (inventoryItem) {
          inventoryItem.availableQuantity += item.quantity;
          inventoryItem.inUseQuantity -= item.quantity;
        }
      }
      await inventory.save();
    }
  }

  entry.isDeleted = true;
  entry.deletedAt = new Date();
  await entry.save();

  return entry;
};

// ─── Get Tenant Summary ──────────────────────────────────────────────────
const getTenantSummary = async (customerId) => {
  const entries = await TenantEntry.find({
    createdBy: customerId,
    isDeleted: false,
  });

  const active = entries.filter((e) => e.status === 'active');
  const completed = entries.filter((e) => e.status === 'completed');
  const disputed = entries.filter((e) => e.status === 'disputed');

  let totalRent = 0;
  let totalDeposit = 0;

  entries.forEach((e) => {
    totalRent += e.monthlyRent || 0;
    totalDeposit += e.securityDeposit || 0;
  });

  return {
    totalTenants: entries.length,
    activeTenants: active.length,
    completedTenants: completed.length,
    disputedTenants: disputed.length,
    totalMonthlyRent: totalRent,
    totalSecurityDeposit: totalDeposit,
    recentEntries: entries.slice(0, 5),
  };
};

// ─── Link Exit Record ─────────────────────────────────────────────────────
const linkExitRecord = async (customerId, entryId, exitId) => {
  const entry = await TenantEntry.findOne({
    _id: entryId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!entry) {
    throw AppError.notFound('Tenant entry not found');
  }

  entry.exitRecordId = exitId;
  entry.status = 'completed';
  await entry.save();

  return entry.populate(populateFields);
};

module.exports = {
  listTenantEntries,
  getTenantEntryById,
  getTenantEntriesByProperty,
  createTenantEntry,
  updateTenantEntry,
  deleteTenantEntry,
  getTenantSummary,
  linkExitRecord,
};