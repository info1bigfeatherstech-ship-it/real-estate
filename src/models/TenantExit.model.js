const mongoose = require('mongoose');

// ─── Enums ────────────────────────────────────────────────────────────────
const EXIT_REASONS = ['Lease End', 'Relocation', 'Upgrade', 'Personal Reasons', 'Other'];
const HANDOVER_STATUSES = ['Completed Successfully', 'Pending Verification', 'Damage Dispute', 'Deposit Hold'];
const CONDITION_OPTIONS = ['Excellent', 'Good', 'Minor Damage', 'Major Damage'];
const YES_NO = ['Yes', 'No'];

// ─── Sub-Schemas ──────────────────────────────────────────────────────────

// Condition Schema
const conditionSchema = new mongoose.Schema(
  {
    condition: {
      type: String,
      enum: CONDITION_OPTIONS,
      default: 'Good',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: null,
    },
  },
  { _id: false }
);

// Inventory Item Verification Schema
const inventoryVerificationSchema = new mongoose.Schema(
  {
    given: { type: Number, default: 0 },
    returned: { type: String, enum: YES_NO, default: 'No' },
    condition: {
      type: String,
      enum: CONDITION_OPTIONS,
      default: 'Good',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: null,
    },
  },
  { _id: false }
);

// Inventory Schema (Key-Value pairs)
const inventorySchema = new mongoose.Schema(
  {
    mainKey: { type: inventoryVerificationSchema, default: () => ({}) },
    bed: { type: inventoryVerificationSchema, default: () => ({}) },
    mattress: { type: inventoryVerificationSchema, default: () => ({}) },
    chair: { type: inventoryVerificationSchema, default: () => ({}) },
    wardrobe: { type: inventoryVerificationSchema, default: () => ({}) },
    acRemote: { type: inventoryVerificationSchema, default: () => ({}) },
    wifiRouter: { type: inventoryVerificationSchema, default: () => ({}) },
    // Dynamic items will be stored separately
  },
  { _id: false }
);

// Exit Meters Schema
const exitMetersSchema = new mongoose.Schema(
  {
    electricity: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    gas: { type: Number, default: 0 },
  },
  { _id: false }
);

// Charges Schema
const chargesSchema = new mongoose.Schema(
  {
    pendingRent: { type: Number, default: 0 },
    electricityCharges: { type: Number, default: 0 },
    waterCharges: { type: Number, default: 0 },
    maintenanceCharges: { type: Number, default: 0 },
    damageCharges: { type: Number, default: 0 },
    cleaningCharges: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
  },
  { _id: false }
);

// Security Deposit Schema
const securityDepositSchema = new mongoose.Schema(
  {
    depositAmount: { type: Number, default: 0 },
    amountDeducted: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

// Property Condition at Exit Schema
const propertyConditionExitSchema = new mongoose.Schema(
  {
    walls: { type: conditionSchema, default: () => ({}) },
    floor: { type: conditionSchema, default: () => ({}) },
    doors: { type: conditionSchema, default: () => ({}) },
    windows: { type: conditionSchema, default: () => ({}) },
    bathroom: { type: conditionSchema, default: () => ({}) },
    kitchen: { type: conditionSchema, default: () => ({}) },
  },
  { _id: false }
);

// Exit Photos Schema
const exitPhotosSchema = new mongoose.Schema(
  {
    room: [{ type: String }],
    damage: [{ type: String }],
    meter: [{ type: String }],
  },
  { _id: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────

const tenantExitSchema = new mongoose.Schema(
  {
    // ─── Reference to Entry ──────────────────────────────────────────────
    entryRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TenantEntry',
      required: [true, 'Entry record is required']
    },

    // ─── Auto-filled from Entry ──────────────────────────────────────────
    tenantName: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    roomNumber: {
      type: String,
      trim: true,
      default: null,
    },
    bedNumber: {
      type: String,
      trim: true,
      default: null,
    },

    // ─── Exit Details ──────────────────────────────────────────────────────
    exitDate: {
      type: Date,
      required: [true, 'Exit date is required'],
    },
    exitTime: {
      type: String,
      trim: true,
      maxlength: [20, 'Exit time cannot exceed 20 characters'],
      default: null,
    },
    reasonForLeaving: {
      type: String,
      enum: EXIT_REASONS,
      required: [true, 'Reason for leaving is required'],
    },
    reasonOther: {
      type: String,
      trim: true,
      maxlength: [200, 'Other reason cannot exceed 200 characters'],
      default: null,
    },

    // ─── Inventory Verification ──────────────────────────────────────────
    inventory: {
      type: inventorySchema,
      default: () => ({}),
    },
    inventoryDynamic: [
      {
        name: { type: String, required: true },
        given: { type: Number, default: 0 },
        returned: { type: String, enum: YES_NO, default: 'No' },
        condition: { type: String, enum: CONDITION_OPTIONS, default: 'Good' },
        remarks: { type: String, trim: true, maxlength: 500, default: null },
      },
    ],

    // ─── Utility Readings at Exit ────────────────────────────────────────
    exitMeters: {
      type: exitMetersSchema,
      default: () => ({}),
    },

    // ─── Charges Assessment ──────────────────────────────────────────────
    charges: {
      type: chargesSchema,
      default: () => ({}),
    },

    // ─── Security Deposit ─────────────────────────────────────────────────
    securityDeposit: {
      type: securityDepositSchema,
      default: () => ({}),
    },

    // ─── Property Condition at Exit ──────────────────────────────────────
    propertyCondition: {
      type: propertyConditionExitSchema,
      default: () => ({}),
    },

    // ─── Missing Items & Damage ──────────────────────────────────────────
    missingItemsList: {
      type: String,
      trim: true,
      maxlength: [2000, 'Missing items list cannot exceed 2000 characters'],
      default: null,
    },
    damageNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Damage notes cannot exceed 2000 characters'],
      default: null,
    },

    // ─── Exit Photos ──────────────────────────────────────────────────────
    exitPhotos: {
      type: exitPhotosSchema,
      default: () => ({}),
    },

    // ─── Final Handover Status ────────────────────────────────────────────
    handoverStatus: {
      type: String,
      enum: HANDOVER_STATUSES,
      default: 'Pending Verification',
      index: true,
    },

    // ─── Handover Confirmation ────────────────────────────────────────────
    tenantSignature: {
      type: String,
      trim: true,
      default: null,
    },
    propertyManagerSignature: {
      type: String,
      trim: true,
      default: null,
    },
    handoverDate: {
      type: Date,
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
tenantExitSchema.index({ tenantName: 'text', mobile: 'text' });
tenantExitSchema.index({ entryRecordId: 1 });
tenantExitSchema.index({ handoverStatus: 1, propertyId: 1 });
tenantExitSchema.index({ createdAt: -1 });

// ─── Pre-save Hooks ──────────────────────────────────────────────────────
tenantExitSchema.pre('save', function normalizeOptionalFields() {
  if (this.bedNumber === '') this.bedNumber = null;
  if (this.reasonOther === '') this.reasonOther = null;
  if (this.missingItemsList === '') this.missingItemsList = null;
  if (this.damageNotes === '') this.damageNotes = null;
});

// ─── Query Helpers ──────────────────────────────────────────────────────
tenantExitSchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

// ─── Virtuals ──────────────────────────────────────────────────────────────
tenantExitSchema.virtual('entryRecord', {
  ref: 'TenantEntry',
  localField: 'entryRecordId',
  foreignField: '_id',
  justOne: true,
});

tenantExitSchema.virtual('property', {
  ref: 'Property',
  localField: 'propertyId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('TenantExit', tenantExitSchema);