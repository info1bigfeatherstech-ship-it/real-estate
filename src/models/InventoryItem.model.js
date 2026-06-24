const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    // ✅ categoryId — Dynamic category reference
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryCategory',
      required: [true, 'Category is required'],
      index: true,
    },
    // ✅ categoryName — Denormalized for quick access (auto-populated)
    categoryName: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
  }
);

inventoryItemSchema.index({ name: 1 });
inventoryItemSchema.index({ categoryId: 1, isActive: 1 });

// ─── Pre-save: Auto-populate categoryName ────────────────────────────────
inventoryItemSchema.pre('save', async function preSaveCategoryName() {
  if (this.categoryId && !this.categoryName) {
    const Category = mongoose.model('InventoryCategory');
    const category = await Category.findById(this.categoryId).lean();
    if (category) {
      this.categoryName = category.name;
    }
  }
});

// ─── Pre-save: Normalize optional fields ──────────────────────────────────
inventoryItemSchema.pre('save', function normalizeOptionalFields() {
  if (this.categoryName === '') this.categoryName = null;
});

// ─── Query Helpers ──────────────────────────────────────────────────────
inventoryItemSchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);