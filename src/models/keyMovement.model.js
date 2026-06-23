const mongoose = require('mongoose');
const { KEY_TYPES, KEY_STATUS, PERSON_TYPES } = require('../constants/keyEnums');

const keyMovementSchema = new mongoose.Schema(
  {
    // ─── Property Reference ────────────────────────────────────────────────
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
      index: true,
    },

    // ─── Key Details ───────────────────────────────────────────────────────
    keyType: {
      type: String,
      enum: KEY_TYPES,
      required: [true, 'Key type is required'],
      index: true,
    },
    keyIdentifier: {
      type: String,
      trim: true,
      maxlength: [50, 'Key identifier cannot exceed 50 characters'],
      default: null,
    },
    keyDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Key description cannot exceed 200 characters'],
      default: null,
    },
    totalKeys: {
      type: Number,
      default: 1,
      min: [1, 'Total keys must be at least 1'],
    },

    // ─── Current Location ──────────────────────────────────────────────────
    currentHolderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Current holder is required'],
      index: true,
    },
    currentHolderType: {
      type: String,
      enum: PERSON_TYPES,
      required: [true, 'Current holder type is required'],
    },
    currentHolderName: {
      type: String,
      trim: true,
      maxlength: [120, 'Holder name cannot exceed 120 characters'],
      required: [true, 'Holder name is required'],
    },
    currentHolderMobile: {
      type: String,
      trim: true,
      maxlength: [20, 'Mobile cannot exceed 20 characters'],
      default: null,
    },

    // ─── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: KEY_STATUS,
      default: 'with_person',
      index: true,
    },

    // ─── Movement History ──────────────────────────────────────────────────
    movements: [
      {
        fromPersonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
          default: null,
        },
        fromPersonType: {
          type: String,
          enum: PERSON_TYPES,
          default: null,
        },
        fromPersonName: {
          type: String,
          trim: true,
          maxlength: [120, 'Name cannot exceed 120 characters'],
          default: null,
        },
        toPersonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
          required: true,
        },
        toPersonType: {
          type: String,
          enum: PERSON_TYPES,
          required: true,
        },
        toPersonName: {
          type: String,
          trim: true,
          maxlength: [120, 'Name cannot exceed 120 characters'],
          required: true,
        },
        toPersonMobile: {
          type: String,
          trim: true,
          maxlength: [20, 'Mobile cannot exceed 20 characters'],
          default: null,
        },
        movementDate: {
          type: Date,
          default: Date.now,
        },
        expectedReturnDate: {
          type: Date,
          default: null,
        },
        actualReturnDate: {
          type: Date,
          default: null,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: [500, 'Notes cannot exceed 500 characters'],
          default: null,
        },
        status: {
          type: String,
          enum: ['active', 'returned'],
          default: 'active',
        },
      },
    ],

    // ─── Return Details ────────────────────────────────────────────────────
    returnedDate: {
      type: Date,
      default: null,
    },
    returnedToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    returnedToName: {
      type: String,
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
      default: null,
    },
    returnNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },

    // ─── System Fields ────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
keyMovementSchema.index({ propertyId: 1, keyType: 1, status: 1 });
keyMovementSchema.index({ currentHolderId: 1, status: 1 });
keyMovementSchema.index({ propertyId: 1, status: 1 });
keyMovementSchema.index({ createdAt: -1 });

// ─── Virtuals ──────────────────────────────────────────────────────────────
keyMovementSchema.virtual('property', {
  ref: 'Property',
  localField: 'propertyId',
  foreignField: '_id',
  justOne: true,
});

keyMovementSchema.virtual('currentHolder', {
  ref: 'Customer',
  localField: 'currentHolderId',
  foreignField: '_id',
  justOne: true,
});

// ─── Pre-save Hooks ──────────────────────────────────────────────────────
keyMovementSchema.pre('save', function normalizeOptionalFields() {
  if (this.keyIdentifier === '') this.keyIdentifier = null;
  if (this.keyDescription === '') this.keyDescription = null;
  if (this.currentHolderMobile === '') this.currentHolderMobile = null;
  if (this.returnNotes === '') this.returnNotes = null;
});

// ─── Query Helpers ──────────────────────────────────────────────────────
keyMovementSchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

// ─── Static Methods ──────────────────────────────────────────────────────

/**
 * Get all keys for a property
 */
keyMovementSchema.statics.getPropertyKeys = async function (propertyId) {
  return this.find({
    propertyId,
    isDeleted: false,
  })
    .populate('currentHolder', 'fullName email mobile accountType')
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Get keys by holder
 */
keyMovementSchema.statics.getKeysByHolder = async function (holderId) {
  return this.find({
    currentHolderId: holderId,
    status: 'with_person',
    isDeleted: false,
  })
    .populate('propertyId', 'title listingId location.city')
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Get key movement history
 */
keyMovementSchema.statics.getKeyHistory = async function (keyId, { page = 1, limit = 20 } = {}) {
  const key = await this.findById(keyId).lean();
  if (!key) return null;

  const skip = (page - 1) * limit;
  const movements = key.movements
    .sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate))
    .slice(skip, skip + limit);

  return {
    key,
    movements,
    total: key.movements.length,
    page,
    limit,
    totalPages: Math.ceil(key.movements.length / limit),
  };
};

module.exports = mongoose.model('KeyMovement', keyMovementSchema);