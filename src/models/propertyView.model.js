const mongoose = require('mongoose');

const propertyViewSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property ID is required'],
      index: true,
    },

    // Viewer Information
    viewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    viewerType: {
      type: String,
      enum: ['guest', 'seeker', 'owner', 'agent'],
      required: true,
      default: 'guest',
    },
    viewerName: {
      type: String,
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
      default: null,
    },
    viewerMobile: {
      type: String,
      trim: true,
      maxlength: [20, 'Mobile cannot exceed 20 characters'],
      default: null,
    },
    viewerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [160, 'Email cannot exceed 160 characters'],
      default: null,
    },

    // Session & Device Information
    sessionId: {
      type: String,
      trim: true,
      index: true,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: [45, 'IP address cannot exceed 45 characters'],
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters'],
      default: null,
    },
    referrer: {
      type: String,
      trim: true,
      maxlength: [500, 'Referrer cannot exceed 500 characters'],
      default: null,
    },

    // View Details
    viewDuration: {
      type: Number, // seconds
      default: 0,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Source
    source: {
      type: String,
      enum: ['direct', 'search', 'related', 'wishlist', 'share', 'other'],
      default: 'direct',
    },

    // Is this a unique view?
    isUnique: {
      type: Boolean,
      default: true,
    },

    // System Fields
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
propertyViewSchema.index({ propertyId: 1, viewedAt: -1 });
propertyViewSchema.index({ propertyId: 1, viewerId: 1, viewedAt: -1 });
propertyViewSchema.index({ sessionId: 1, propertyId: 1 });
propertyViewSchema.index({ viewedAt: -1 });

// ─── Virtuals ──────────────────────────────────────────────────────────────
propertyViewSchema.virtual('property', {
  ref: 'Property',
  localField: 'propertyId',
  foreignField: '_id',
  justOne: true,
});

// ─── Query Helpers ──────────────────────────────────────────────────────
propertyViewSchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

// ─── Static Methods ──────────────────────────────────────────────────────

/**
 * Get view count for a property
 */
propertyViewSchema.statics.getViewCount = async function (propertyId, unique = false) {
  const match = { propertyId, isDeleted: false };
  if (unique) {
    return this.distinct('sessionId', match).then((sessions) => sessions.length);
  }
  return this.countDocuments(match);
};

/**
 * Get views for a property with pagination
 */
propertyViewSchema.statics.getPropertyViews = async function (
  propertyId,
  { page = 1, limit = 20, sortBy = 'viewedAt', sortOrder = 'desc' } = {}
) {
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [views, total] = await Promise.all([
    this.find({ propertyId, isDeleted: false })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('viewerId', 'fullName email mobile accountType')
      .lean(),
    this.countDocuments({ propertyId, isDeleted: false }),
  ]);

  return { views, total, page, limit };
};

module.exports = mongoose.model('PropertyView', propertyViewSchema);