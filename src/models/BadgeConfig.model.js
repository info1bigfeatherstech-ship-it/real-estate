// backend/src/models/BadgeConfig.model.js
const mongoose = require('mongoose');

const badgeConfigSchema = new mongoose.Schema(
  {
    tiers: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        minDeals: {
          type: Number,
          required: true,
          min: 0,
        },
        maxDeals: {
          type: Number,
          default: null,
        },
        level: {
          type: Number,
          required: true,
          min: 1,
        },
        color: {
          type: String,
          default: '#6b7280',
        },
        icon: {
          type: String,
          default: '🏠',
        },
        description: {
          type: String,
          trim: true,
          maxlength: [200, 'Description cannot exceed 200 characters'],
          default: null,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Singleton: Only one config document ──────────────────────────────────
badgeConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({
      tiers: [
        { name: 'Rookie', minDeals: 0, maxDeals: 4, level: 1, color: '#22c55e', icon: '🌱', description: 'Just getting started' },
        { name: 'Bronze', minDeals: 5, maxDeals: 14, level: 2, color: '#cd7f32', icon: '🥉', description: 'Building reputation' },
        { name: 'Silver', minDeals: 15, maxDeals: 29, level: 3, color: '#c0c0c0', icon: '🥈', description: 'Trusted agent' },
        { name: 'Gold', minDeals: 30, maxDeals: 49, level: 4, color: '#fbbf24', icon: '🥇', description: 'Top performer' },
        { name: 'Platinum', minDeals: 50, maxDeals: 99, level: 5, color: '#3b82f6', icon: '💎', description: 'Elite agent' },
        { name: 'Diamond', minDeals: 100, maxDeals: null, level: 6, color: '#8b5cf6', icon: '👑', description: 'Legendary agent' },
      ],
    });
  }
  return config;
};

module.exports = mongoose.model('BadgeConfig', badgeConfigSchema);      