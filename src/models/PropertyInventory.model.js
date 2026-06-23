const mongoose = require('mongoose');

// ─── Inventory Item Schema ──────────────────────────────────────────────────
const inventoryItemSchema = new mongoose.Schema(
  {
    masterItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: [true, 'Master item is required'],
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [0, 'Total quantity cannot be negative'],
      default: 0,
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      default: 0,
    },
    inUseQuantity: {
      type: Number,
      required: [true, 'In-use quantity is required'],
      min: [0, 'In-use quantity cannot be negative'],
      default: 0,
    },
    condition: {
      type: String,
      trim: true,
      maxlength: [100, 'Condition cannot exceed 100 characters'],
      default: 'Good',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: null,
    },
  },
  { _id: true, timestamps: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────

const propertyInventorySchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
      index: true,
      unique: true, // One inventory per property
    },
    items: [inventoryItemSchema],
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
propertyInventorySchema.index({ propertyId: 1, isDeleted: 1 });
propertyInventorySchema.index({ createdBy: 1, isDeleted: 1 });

// ─── Pre-save Hooks ──────────────────────────────────────────────────────
propertyInventorySchema.pre('save', function normalizeOptionalFields() {
  if (!this.items || this.items.length === 0) {
    this.items = [];
  }
  this.items.forEach((item) => {
    if (item.remarks === '') item.remarks = null;
  });
});

// ─── Query Helpers ──────────────────────────────────────────────────────
propertyInventorySchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

// ─── Virtuals ──────────────────────────────────────────────────────────────
propertyInventorySchema.virtual('property', {
  ref: 'Property',
  localField: 'propertyId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('PropertyInventory', propertyInventorySchema);