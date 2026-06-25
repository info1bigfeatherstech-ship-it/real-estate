const mongoose = require('mongoose');
const { SOCIAL_PLATFORMS } = require('../constants/socialEnums');

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: SOCIAL_PLATFORMS,
      required: [true, 'Platform is required'],
      unique: true,
      index: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: [50, 'Label cannot exceed 50 characters'],
      default: null,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      maxlength: [500, 'URL cannot exceed 500 characters'],
      validate: {
        validator: function (value) {
          if (!value) return true;
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Invalid URL format',
      },
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [50, 'Icon cannot exceed 50 characters'],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
socialLinkSchema.index({ platform: 1, isActive: 1 });
socialLinkSchema.index({ displayOrder: 1, isActive: 1 });

// ─── Virtuals ──────────────────────────────────────────────────────────────
socialLinkSchema.virtual('platformIcon', {
  ref: 'PlatformIcon',
  localField: 'platform',
  foreignField: 'platform',
  justOne: true,
});

// ─── Pre-save Hooks ──────────────────────────────────────────────────────
socialLinkSchema.pre('save', function normalizeFields() {
  if (this.label === '') this.label = null;
  if (this.icon === '') this.icon = null;
  if (this.url) {
    this.url = this.url.trim();
  }
});

// ─── Query Helpers ──────────────────────────────────────────────────────
socialLinkSchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

// ─── Static Methods ──────────────────────────────────────────────────────

/**
 * Get active social links for public display
 */
socialLinkSchema.statics.getActiveLinks = async function () {
  return this.find({
    isDeleted: false,
    isActive: true,
  })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();
};

/**
 * Check if a platform link exists
 */
socialLinkSchema.statics.platformExists = async function (platform) {
  const link = await this.findOne({
    platform,
    isDeleted: false,
  });
  return Boolean(link);
};

/**
 * Get share URLs for a property
 */
socialLinkSchema.statics.getShareUrls = async function (propertyUrl, propertyTitle) {
  const activeLinks = await this.getActiveLinks();
  const { SHARE_URL_TEMPLATES } = require('../constants/socialEnums');

  return activeLinks
    .map((link) => {
      const template = SHARE_URL_TEMPLATES[link.platform];
      if (!template) return null;

      const encodedUrl = encodeURIComponent(propertyUrl);
      const encodedTitle = encodeURIComponent(propertyTitle || '');

      let shareUrl = template + encodedUrl;
      if (link.platform === 'twitter' || link.platform === 'whatsapp') {
        shareUrl += `&text=${encodedTitle}`;
      }

      return {
        platform: link.platform,
        label: link.label || link.platform,
        icon: link.icon || null,
        url: shareUrl,
        isActive: link.isActive,
      };
    })
    .filter(Boolean);
};

module.exports = mongoose.model('SocialLink', socialLinkSchema);