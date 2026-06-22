const mongoose = require('mongoose');

const INVENTORY_CATEGORIES = [
  'Furniture',
  'Appliance',
  'Key',
  'Accessory',
  'Other',
];

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      enum: INVENTORY_CATEGORIES,
      default: 'Other',
      index: true,
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
  },
  {
    timestamps: true,
  }
);

inventoryItemSchema.index({ name: 1 });
inventoryItemSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);