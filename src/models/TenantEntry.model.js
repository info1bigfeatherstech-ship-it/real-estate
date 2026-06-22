const mongoose = require('mongoose');

// ─── Enums ────────────────────────────────────────────────────────────────
const OCCUPANT_TYPES = ['Family', 'Bachelor', 'Student', 'Working Professional'];
const ENTRY_STATUSES = ['active', 'completed', 'disputed'];

// ─── Sub-Schemas ──────────────────────────────────────────────────────────

// Keys Schema
const keysSchema = new mongoose.Schema(
  {
    mainDoor: { count: { type: Number, default: 0 } },
    room: { count: { type: Number, default: 0 } },
    cupboard: { count: { type: Number, default: 0 } },
    drawer: { count: { type: Number, default: 0 } },
    accessCard: { count: { type: Number, default: 0 } },
    parkingRemote: { count: { type: Number, default: 0 } },
    other: { type: String, trim: true, default: null },
  },
  { _id: false }
);

// Meter Readings Schema
const metersSchema = new mongoose.Schema(
  {
    electricity: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    gas: { type: Number, default: 0 },
  },
  { _id: false }
);

// Item Schema (for furniture, appliances)
const itemSchema = new mongoose.Schema(
  {
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    condition: { type: String, default: 'Good' },
  },
  { _id: true }
);

// Property Condition Schema
const propertyConditionSchema = new mongoose.Schema(
  {
    walls: { type: String, trim: true, default: null },
    floor: { type: String, trim: true, default: null },
    doors: { type: String, trim: true, default: null },
    windows: { type: String, trim: true, default: null },
    bathroom: { type: String, trim: true, default: null },
    kitchen: { type: String, trim: true, default: null },
  },
  { _id: false }
);

// Photos Schema
const photosSchema = new mongoose.Schema(
  {
    room: [{ type: String }],
    furniture: [{ type: String }],
    appliance: [{ type: String }],
    meter: [{ type: String }],
  },
  { _id: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────

const tenantEntrySchema = new mongoose.Schema(
  {
    // ─── Tenant Details ──────────────────────────────────────────────────
    tenantName: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
      maxlength: [120, 'Tenant name cannot exceed 120 characters'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      maxlength: [20, 'Mobile number cannot exceed 20 characters'],
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [160, 'Email cannot exceed 160 characters'],
      default: null,
    },
    tenantId: {
      type: String,
      unique: true,
      index: true,
    },
    occupantType: {
      type: String,
      enum: OCCUPANT_TYPES,
      required: [true, 'Occupant type is required'],
    },

    // ─── Property Details ────────────────────────────────────────────────
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
      index: true,
    },
    roomNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Room number cannot exceed 50 characters'],
    },
    bedNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Bed number cannot exceed 50 characters'],
      default: null,
    },
    propertyAddress: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
      default: null,
    },

    // ─── Agreement Details ────────────────────────────────────────────────
    agreementStartDate: {
      type: Date,
      required: [true, 'Agreement start date is required'],
    },
    agreementEndDate: {
      type: Date,
      required: [true, 'Agreement end date is required'],
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Monthly rent cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: [0, 'Security deposit cannot be negative'],
    },
    lockInPeriod: {
      type: String,
      trim: true,
      maxlength: [50, 'Lock-in period cannot exceed 50 characters'],
      default: null,
    },

    // ─── Handover Details ─────────────────────────────────────────────────
    handoverDate: {
      type: Date,
      default: null,
    },
    possessionDate: {
      type: Date,
      default: null,
    },
    possessionTime: {
      type: String,
      trim: true,
      maxlength: [20, 'Possession time cannot exceed 20 characters'],
      default: null,
    },

    // ─── Keys ──────────────────────────────────────────────────────────────
    keys: {
      type: keysSchema,
      default: () => ({}),
    },

    // ─── Utility Meter Readings ───────────────────────────────────────────
    meters: {
      type: metersSchema,
      default: () => ({}),
    },

    // ─── Furniture ─────────────────────────────────────────────────────────
    furniture: [itemSchema],

    // ─── Appliances ────────────────────────────────────────────────────────
    appliances: [itemSchema],

    // ─── Property Condition ───────────────────────────────────────────────
    propertyCondition: {
      type: propertyConditionSchema,
      default: () => ({}),
    },

    // ─── Photos ────────────────────────────────────────────────────────────
    photos: {
      type: photosSchema,
      default: () => ({}),
    },

    // ─── Remarks ───────────────────────────────────────────────────────────
    remarks: {
      existingDamage: {
        type: String,
        trim: true,
        maxlength: [2000, 'Damage notes cannot exceed 2000 characters'],
        default: null,
      },
      missingItems: {
        type: String,
        trim: true,
        maxlength: [2000, 'Missing items notes cannot exceed 2000 characters'],
        default: null,
      },
    },

    // ─── Tenant Acknowledgement ────────────────────────────────────────────
    tenantSignature: {
      type: String,
      trim: true,
      default: null,
    },
    signatureDate: {
      type: Date,
      default: null,
    },

    // ─── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ENTRY_STATUSES,
      default: 'active',
      index: true,
    },
    exitRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TenantExit',
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
tenantEntrySchema.index({ tenantName: 'text', mobile: 'text', email: 'text' });
tenantEntrySchema.index({ status: 1, propertyId: 1 });
tenantEntrySchema.index({ createdAt: -1 });

// ─── Pre-save Hooks ──────────────────────────────────────────────────────
tenantEntrySchema.pre('save', function assignTenantId() {
  if (!this.tenantId) {
    const crypto = require('crypto');
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const numeric = Math.floor(10000 + Math.random() * 90000);
    this.tenantId = `TEN-${numeric}-${suffix}`;
  }
});

tenantEntrySchema.pre('save', function normalizeOptionalFields() {
  if (this.email === '') this.email = null;
  if (this.bedNumber === '') this.bedNumber = null;
  if (this.propertyAddress === '') this.propertyAddress = null;
  if (this.remarks?.existingDamage === '') this.remarks.existingDamage = null;
  if (this.remarks?.missingItems === '') this.remarks.missingItems = null;
});

// ─── Query Helpers ──────────────────────────────────────────────────────
tenantEntrySchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

// ─── Virtuals ──────────────────────────────────────────────────────────────
tenantEntrySchema.virtual('property', {
  ref: 'Property',
  localField: 'propertyId',
  foreignField: '_id',
  justOne: true,
});

tenantEntrySchema.virtual('exitRecord', {
  ref: 'TenantExit',
  localField: 'exitRecordId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('TenantEntry', tenantEntrySchema);