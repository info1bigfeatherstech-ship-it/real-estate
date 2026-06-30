const KeyMovement = require('../../models/keyMovement.model');
const Property = require('../../models/Property.model');
const Customer = require('../../models/Customer.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { escapeRegex } = require('../../utils/regex');

// ─── Populate Fields ──────────────────────────────────────────────────────
const populateFields = [
  { path: 'propertyId', select: 'title listingId location.city' },
  { path: 'currentHolder', select: 'fullName email mobile accountType' },
  { path: 'createdBy', select: 'fullName email' },
];

// ─── Build List Filter ────────────────────────────────────────────────────
const buildListFilter = (customerId, { search, propertyId, status, keyType }) => {
  const filter = { isDeleted: false };

  if (propertyId) filter.propertyId = propertyId;
  if (status) filter.status = status;
  if (keyType) filter.keyType = keyType;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { keyType: pattern },
      { keyIdentifier: pattern },
      { currentHolderName: pattern },
      { currentHolderMobile: pattern },
    ];
  }

  return filter;
};

// ─── List Keys ────────────────────────────────────────────────────────────
const listKeys = async (customerId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(customerId, query);
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [keys, total] = await Promise.all([
    KeyMovement.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateFields)
      .lean(),
    KeyMovement.countDocuments(filter),
  ]);

  return {
    keys,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

// ─── Get Key by ID ────────────────────────────────────────────────────────
const getKeyById = async (customerId, keyId) => {
  const key = await KeyMovement.findOne({
    _id: keyId,
    isDeleted: false,
  })
    .populate(populateFields)
    .lean();

  if (!key) {
    throw AppError.notFound('Key not found');
  }

  return key;
};

// ─── Get Property Keys ────────────────────────────────────────────────────
const getPropertyKeys = async (customerId, propertyId) => {
  // Check if property exists
  const property = await Property.findOne({
    _id: propertyId,
    isDeleted: false,
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  const keys = await KeyMovement.getPropertyKeys(propertyId);
  return keys;
};

// ─── Get Keys by Holder ──────────────────────────────────────────────────
const getKeysByHolder = async (customerId, holderId) => {
  // Check if holder exists
  const holder = await Customer.findOne({
    _id: holderId,
    isDeleted: false,
  });

  if (!holder) {
    throw AppError.notFound('Holder not found');
  }

  const keys = await KeyMovement.getKeysByHolder(holderId);
  return keys;
};

// ─── Create Key ───────────────────────────────────────────────────────────
const createKey = async (customerId, data) => {
  // Check if property exists
  const property = await Property.findOne({
    _id: data.propertyId,
    isDeleted: false,
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  // Check if holder exists
  const holder = await Customer.findOne({
    _id: data.currentHolderId,
    isDeleted: false,
  });

  if (!holder) {
    throw AppError.notFound('Holder not found');
  }

  // Create key
  const key = await KeyMovement.create({
    ...data,
    createdBy: customerId,
    lastUpdatedBy: customerId,
  });

  return KeyMovement.findById(key._id).populate(populateFields);
};

// ─── Move Key ─────────────────────────────────────────────────────────────
const moveKey = async (customerId, keyId, moveData) => {
  const key = await KeyMovement.findOne({
    _id: keyId,
    isDeleted: false,
    status: 'with_person',
  });

  if (!key) {
    throw AppError.notFound('Key not found or not available for transfer');
  }

  // Check if new holder exists
  const newHolder = await Customer.findOne({
    _id: moveData.toPersonId,
    isDeleted: false,
  });

  if (!newHolder) {
    throw AppError.notFound('Recipient not found');
  }

  // Create movement record
  const movement = {
    fromPersonId: key.currentHolderId,
    fromPersonType: key.currentHolderType,
    fromPersonName: key.currentHolderName,
    toPersonId: moveData.toPersonId,
    toPersonType: moveData.toPersonType,
    toPersonName: moveData.toPersonName,
    toPersonMobile: moveData.toPersonMobile || null,
    movementDate: new Date(),
    expectedReturnDate: moveData.expectedReturnDate || null,
    notes: moveData.notes || null,
    status: 'active',
  };

  // Update key
  key.currentHolderId = moveData.toPersonId;
  key.currentHolderType = moveData.toPersonType;
  key.currentHolderName = moveData.toPersonName;
  key.currentHolderMobile = moveData.toPersonMobile || null;
  key.movements.push(movement);
  key.lastUpdatedBy = customerId;

  await key.save();

  return KeyMovement.findById(key._id).populate(populateFields);
};

// ─── Return Key ───────────────────────────────────────────────────────────
const returnKey = async (customerId, keyId, returnData) => {
  const key = await KeyMovement.findOne({
    _id: keyId,
    isDeleted: false,
    status: 'with_person',
  });

  if (!key) {
    throw AppError.notFound('Key not found or already returned');
  }

  // Get the last active movement
  const lastMovement = key.movements
    .filter((m) => m.status === 'active')
    .sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate))[0];

  if (lastMovement) {
    lastMovement.status = 'returned';
    lastMovement.actualReturnDate = new Date();
  }

  // Update key status
  key.status = 'returned';
  key.returnedDate = new Date();
  key.returnedToId = returnData.returnedToId;
  key.returnedToName = returnData.returnedToName;
  key.returnNotes = returnData.returnNotes || null;
  key.lastUpdatedBy = customerId;

  await key.save();

  return KeyMovement.findById(key._id).populate(populateFields);
};

// ─── Update Key Status ────────────────────────────────────────────────────
const updateKeyStatus = async (customerId, keyId, { status, notes }) => {
  const key = await KeyMovement.findOne({
    _id: keyId,
    isDeleted: false,
  });

  if (!key) {
    throw AppError.notFound('Key not found');
  }

  key.status = status;
  if (notes) {
    key.returnNotes = notes;
  }
  key.lastUpdatedBy = customerId;

  await key.save();

  return KeyMovement.findById(key._id).populate(populateFields);
};

// ─── Delete Key ───────────────────────────────────────────────────────────
const deleteKey = async (customerId, keyId) => {
  const key = await KeyMovement.findOne({
    _id: keyId,
    isDeleted: false,
  });

  if (!key) {
    throw AppError.notFound('Key not found');
  }

  key.isDeleted = true;
  key.deletedAt = new Date();
  await key.save();

  return key;
};

// ─── Get Key Movement History ─────────────────────────────────────────────
const getKeyHistory = async (customerId, keyId, query = {}) => {
  const key = await KeyMovement.findOne({
    _id: keyId,
    isDeleted: false,
  });

  if (!key) {
    throw AppError.notFound('Key not found');
  }

  const { page = 1, limit = 20 } = query;
  const result = await KeyMovement.getKeyHistory(keyId, { page, limit });

  return result;
};

// ─── Get Key Summary ──────────────────────────────────────────────────────
const getKeySummary = async (customerId) => {
  const [total, withPerson, returned, lost, damaged] = await Promise.all([
    KeyMovement.countDocuments({ isDeleted: false }),
    KeyMovement.countDocuments({ isDeleted: false, status: 'with_person' }),
    KeyMovement.countDocuments({ isDeleted: false, status: 'returned' }),
    KeyMovement.countDocuments({ isDeleted: false, status: 'lost' }),
    KeyMovement.countDocuments({ isDeleted: false, status: 'damaged' }),
  ]);

  const recentKeys = await KeyMovement.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('propertyId', 'title listingId')
    .populate('currentHolder', 'fullName email')
    .lean();

  return {
    totalKeys: total,
    withPerson: withPerson,
    returned: returned,
    lost: lost,
    damaged: damaged,
    recentKeys,
  };
};

module.exports = {
  listKeys,
  getKeyById,
  getPropertyKeys,
  getKeysByHolder,
  createKey,
  moveKey,
  returnKey,
  updateKeyStatus,
  deleteKey,
  getKeyHistory,
  getKeySummary,
};
