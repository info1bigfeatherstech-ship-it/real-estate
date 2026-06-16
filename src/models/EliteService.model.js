const mongoose = require('mongoose');
const {
  ELITE_SERVICE_ROLES,
  ELITE_SERVICE_STATUSES,
} = require('../constants/eliteServiceEnums');

const eliteServiceSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ELITE_SERVICE_ROLES,
      required: [true, 'Service role is required'],
      index: true,
    },
    providerName: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
      maxlength: [120, 'Provider name cannot exceed 120 characters'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,   
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    primaryMobile: {
      type: String,
      required: [true, 'Primary mobile is required'],
      trim: true,
      maxlength: [20, 'Primary mobile cannot exceed 20 characters'],
    },
    secondaryMobile: {
      type: String,
      trim: true,
      maxlength: [20, 'Secondary mobile cannot exceed 20 characters'],
      default: null,
    },
    status: {
      type: String,
      enum: ELITE_SERVICE_STATUSES,
      default: 'Available',
      index: true,
    },
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

eliteServiceSchema.index(
  { providerName: 'text', address: 'text', primaryMobile: 'text', secondaryMobile: 'text' },
  { weights: { providerName: 10, address: 5, primaryMobile: 3, secondaryMobile: 2 } }
);
eliteServiceSchema.index({ isDeleted: 1, status: 1, role: 1 });
eliteServiceSchema.index({ isDeleted: 1, createdAt: -1 });

eliteServiceSchema.pre('save', function normalizeMobileFields() {
  if (this.secondaryMobile === '') {
    this.secondaryMobile = null;
  }
});

eliteServiceSchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('EliteService', eliteServiceSchema);
