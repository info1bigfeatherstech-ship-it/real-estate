const TenantExit = require('../../models/TenantExit.model');
const TenantEntry = require('../../models/TenantEntry.model');
const Property = require('../../models/Property.model');
const PropertyInventory = require('../../models/PropertyInventory.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { escapeRegex } = require('../../utils/regex');
const storageService = require('../storage/storage.service'); // ← ADD
const { processImageToWebp } = require('../media/imageProcessor.service'); // ← ADD

// ─── Populate Fields ──────────────────────────────────────────────────────
const populateFields = [
  { path: 'entryRecordId', select: 'tenantName mobile tenantId propertyId roomNumber bedNumber' },
  { path: 'propertyId', select: 'title listingType location.city' },
  { path: 'createdBy', select: 'fullName email mobile accountType' },
];

// ─── 📸 PHOTO UPLOAD HELPERS (NEW) ──────────────────────────────────────

/**
 * Upload a single photo to storage
 */
const uploadPhoto = async (file, folder = 'tenants/exit') => {
  const processed = await processImageToWebp(file.buffer);
  
  const timestamp = Date.now();
  const storageKey = `${folder}/${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}.webp`;
  
  const uploaded = await storageService.uploadImage({
    buffer: processed.buffer,
    storageKey,
    contentType: processed.mimeType,
  });
  
  return uploaded.url;
};

/**
 * Upload array of photos
 */
const uploadPhotoArray = async (files, folder = 'tenants/exit') => {
  if (!files || files.length === 0) return [];
  const urls = [];
  for (const file of files) {
    try {
      const url = await uploadPhoto(file, folder);
      urls.push(url);
    } catch (error) {
      console.error('Failed to upload photo:', error);
    }
  }
  return urls;
};

/**
 * Process all photo fields from request files
 */
const processExitPhotos = async (files) => {
  const photos = {
    room: [],
    damage: [],
    meter: [],
  };

  if (files) {
    if (files.exitRoomPhotos) {
      photos.room = await uploadPhotoArray(files.exitRoomPhotos, 'tenants/exit/room');
    }
    if (files.exitDamagePhotos) {
      photos.damage = await uploadPhotoArray(files.exitDamagePhotos, 'tenants/exit/damage');
    }
    if (files.exitMeterPhotos) {
      photos.meter = await uploadPhotoArray(files.exitMeterPhotos, 'tenants/exit/meter');
    }
  }

  return photos;
};

// ─── Build List Filter ────────────────────────────────────────────────────
const buildListFilter = (customerId, { search, propertyId, handoverStatus }) => {
  const filter = {
    isDeleted: false,
    createdBy: customerId,
  };

  if (propertyId) filter.propertyId = propertyId;
  if (handoverStatus) filter.handoverStatus = handoverStatus;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { tenantName: pattern },
      { mobile: pattern },
    ];
  }

  return filter;
};

// ─── Get Entry Record for Auto-fill ──────────────────────────────────────
const getEntryForExit = async (customerId, entryId) => {
  const entry = await TenantEntry.findOne({
    _id: entryId,
    isDeleted: false,
    createdBy: customerId,
    status: 'active',
  }).populate('propertyId', 'title listingType location.city');

  if (!entry) {
    throw AppError.notFound('Active tenant entry not found');
  }

  if (entry.exitRecordId) {
    throw AppError.badRequest('Tenant already has an exit record');
  }

  return entry;
};

// ─── Update Inventory on Exit ─────────────────────────────────────────────
const updateInventoryOnExit = async (propertyId, items, customerId) => {
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
      (i) => i.name.toLowerCase() === item.name.toLowerCase()
    );

    if (!inventoryItem) {
      continue;
    }

    if (item.returned === 'Yes') {
      inventoryItem.availableQuantity += item.given;
      inventoryItem.inUseQuantity -= item.given;
    }
  }

  inventory.lastUpdatedBy = customerId;
  await inventory.save();
  return inventory;
};

// ─── Helper: Get item quantity from entry ──────────────────────────────
const getItemQuantity = (entry, name) => {
  const items = [...(entry.furniture || []), ...(entry.appliances || [])];
  const found = items.find((item) => item.name === name);
  return found ? found.quantity : 0;
};

// ─── Helper: Get dynamic inventory from entry ──────────────────────────
const getDynamicInventory = (entry) => {
  const dynamicItems = [];
  const items = [...(entry.furniture || []), ...(entry.appliances || [])];

  const standardItems = ['Bed', 'Mattress', 'Chair', 'Wardrobe', 'AC', 'Wi-Fi Router'];

  for (const item of items) {
    if (!standardItems.includes(item.name)) {
      dynamicItems.push({
        name: item.name,
        given: item.quantity,
        returned: 'No',
        condition: 'Good',
        remarks: null,
      });
    }
  }

  return dynamicItems;
};

// ─── Helper: Get all items for inventory update ──────────────────────
const getAllItemsForInventory = (exit) => {
  const items = [];

  const standardMap = {
    mainKey: 'Main Door Key',
    bed: 'Bed',
    mattress: 'Mattress',
    chair: 'Chair',
    wardrobe: 'Wardrobe',
    acRemote: 'AC',
    wifiRouter: 'Wi-Fi Router',
  };

  if (exit.inventory) {
    for (const [key, value] of Object.entries(exit.inventory)) {
      if (standardMap[key] && value.returned === 'Yes') {
        items.push({
          name: standardMap[key],
          given: value.given || 0,
          returned: value.returned,
          condition: value.condition,
        });
      }
    }
  }

  if (exit.inventoryDynamic) {
    for (const item of exit.inventoryDynamic) {
      if (item.returned === 'Yes') {
        items.push({
          name: item.name,
          given: item.given || 0,
          returned: item.returned,
          condition: item.condition,
        });
      }
    }
  }

  return items;
};

// ─── List Tenant Exits ────────────────────────────────────────────────────
const listTenantExits = async (customerId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(customerId, query);
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [exits, total] = await Promise.all([
    TenantExit.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateFields)
      .lean(),
    TenantExit.countDocuments(filter),
  ]);

  return {
    exits,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

// ─── Get Tenant Exit by ID ──────────────────────────────────────────────
const getTenantExitById = async (customerId, exitId) => {
  const exit = await TenantExit.findOne({
    _id: exitId,
    isDeleted: false,
    createdBy: customerId,
  }).populate(populateFields);

  if (!exit) {
    throw AppError.notFound('Tenant exit not found');
  }

  return exit;
};

// ─── Get Tenant Exit by Entry ────────────────────────────────────────────
const getTenantExitByEntry = async (customerId, entryId) => {
  const entry = await TenantEntry.findOne({
    _id: entryId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!entry) {
    throw AppError.notFound('Tenant entry not found');
  }

  if (!entry.exitRecordId) {
    throw AppError.notFound('No exit record found for this entry');
  }

  const exit = await TenantExit.findOne({
    _id: entry.exitRecordId,
    isDeleted: false,
  }).populate(populateFields);

  return exit;
};

// ─── Create Tenant Exit (WITH PHOTO UPLOAD) ──────────────────────────────
const createTenantExit = async (customerId, data, files = {}) => {
  // Get entry record for auto-fill
  const entry = await getEntryForExit(customerId, data.entryRecordId);

  // 📸 Process photos from files
  const exitPhotos = await processExitPhotos(files);

  // Build exit data with auto-filled fields from entry
  const exitData = {
    entryRecordId: entry._id,
    tenantName: entry.tenantName,
    mobile: entry.mobile,
    propertyId: entry.propertyId,
    roomNumber: entry.roomNumber || null,
    bedNumber: entry.bedNumber || null,

    exitDate: data.exitDate,
    exitTime: data.exitTime || null,
    reasonForLeaving: data.reasonForLeaving,
    reasonOther: data.reasonOther || null,

    inventory: {
      mainKey: { given: entry.keys?.mainDoor?.count || 0 },
      bed: { given: getItemQuantity(entry, 'Bed') },
      mattress: { given: getItemQuantity(entry, 'Mattress') },
      chair: { given: getItemQuantity(entry, 'Chair') },
      wardrobe: { given: getItemQuantity(entry, 'Wardrobe') },
      acRemote: { given: getItemQuantity(entry, 'AC') },
      wifiRouter: { given: getItemQuantity(entry, 'Wi-Fi Router') },
    },

    inventoryDynamic: getDynamicInventory(entry),

    exitMeters: data.exitMeters || {},
    charges: data.charges || {},
    securityDeposit: data.securityDeposit || {},

    propertyCondition: data.propertyCondition || {},

    missingItemsList: data.missingItemsList || null,
    damageNotes: data.damageNotes || null,

    // 📸 Merge photos
    exitPhotos: {
      ...data.exitPhotos,
      ...exitPhotos,
    },

    handoverStatus: data.handoverStatus || 'Pending Verification',
    tenantSignature: data.tenantSignature || null,
    propertyManagerSignature: data.propertyManagerSignature || null,
    handoverDate: data.handoverDate || null,

    createdBy: customerId,
    lastUpdatedBy: customerId,
  };

  // Create exit record
  const exit = await TenantExit.create(exitData);

  // Update inventory with returned items
  const allItems = getAllItemsForInventory(exit);
  if (allItems.length > 0) {
    await updateInventoryOnExit(entry.propertyId, allItems, customerId);
  }

  // Link exit record to entry
  entry.exitRecordId = exit._id;
  entry.status = 'completed';
  entry.lastUpdatedBy = customerId;
  await entry.save();

  return TenantExit.findById(exit._id).populate(populateFields);
};

// ─── Update Tenant Exit ──────────────────────────────────────────────────
const updateTenantExit = async (customerId, exitId, updates) => {
  const exit = await TenantExit.findOne({
    _id: exitId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!exit) {
    throw AppError.notFound('Tenant exit not found');
  }

  if (updates.handoverStatus === 'Completed Successfully' && !exit.handoverDate) {
    updates.handoverDate = new Date();
  }

  const updated = await TenantExit.findOneAndUpdate(
    { _id: exitId, isDeleted: false, createdBy: customerId },
    { ...updates, lastUpdatedBy: customerId },
    { new: true, runValidators: true }
  ).populate(populateFields);

  return updated;
};

// ─── Delete Tenant Exit ──────────────────────────────────────────────────
const deleteTenantExit = async (customerId, exitId) => {
  const exit = await TenantExit.findOne({
    _id: exitId,
    isDeleted: false,
    createdBy: customerId,
  });

  if (!exit) {
    throw AppError.notFound('Tenant exit not found');
  }

  await TenantEntry.findOneAndUpdate(
    { _id: exit.entryRecordId, isDeleted: false },
    { exitRecordId: null, status: 'active' }
  );

  exit.isDeleted = true;
  exit.deletedAt = new Date();
  await exit.save();

  return exit;
};

// ─── Get Tenant Exit Summary ────────────────────────────────────────────
const getTenantExitSummary = async (customerId) => {
  const exits = await TenantExit.find({
    createdBy: customerId,
    isDeleted: false,
  });

  const pending = exits.filter((e) => e.handoverStatus === 'Pending Verification');
  const completed = exits.filter((e) => e.handoverStatus === 'Completed Successfully');
  const disputed = exits.filter((e) => e.handoverStatus === 'Damage Dispute');

  let totalRefund = 0;
  let totalDeductions = 0;

  exits.forEach((e) => {
    totalRefund += e.securityDeposit?.refundAmount || 0;
    totalDeductions += e.securityDeposit?.amountDeducted || 0;
  });

  return {
    totalExits: exits.length,
    pendingExits: pending.length,
    completedExits: completed.length,
    disputedExits: disputed.length,
    totalRefundAmount: totalRefund,
    totalDeductions: totalDeductions,
    recentExits: exits.slice(0, 5),
  };
};

module.exports = {
  listTenantExits,
  getTenantExitById,
  getTenantExitByEntry,
  getEntryForExit,
  createTenantExit,
  updateTenantExit,
  deleteTenantExit,
  getTenantExitSummary,
};