const mongoose = require('mongoose');
const BadgeConfig = require('./BadgeConfig.model');

const agentBadgeSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Agent ID is required'],
      unique: true,
      index: true,
    },
    totalDeals: {
      type: Number,
      default: 0,
      min: [0, 'Total deals cannot be negative'],
    },
    salesDeals: {
      type: Number,
      default: 0,
      min: [0, 'Sales deals cannot be negative'],
    },
    rentalDeals: {
      type: Number,
      default: 0,
      min: [0, 'Rental deals cannot be negative'],
    },
    currentBadge: {
      name: { type: String, default: 'Rookie' },
      level: { type: Number, default: 1 },
      color: { type: String, default: '#22c55e' },
      icon: { type: String, default: '🌱' },
    },
    badgeHistory: [
      {
        badgeName: { type: String, required: true },
        achievedAt: { type: Date, default: Date.now },
        dealsAtAchievement: { type: Number, required: true },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
agentBadgeSchema.index({ totalDeals: -1 });
agentBadgeSchema.index({ agentId: 1, totalDeals: -1 });

// ─── Virtuals ──────────────────────────────────────────────────────────────
agentBadgeSchema.virtual('agent', {
  ref: 'Customer',
  localField: 'agentId',
  foreignField: '_id',
  justOne: true,
});

// ─── Method: Get badge for deals ──────────────────────────────────────────
agentBadgeSchema.methods.getBadgeForDeals = async function (deals) {
  const config = await BadgeConfig.getConfig();
  let badge = config.tiers[0];
  for (const tier of config.tiers) {
    if (tier.isActive !== false && deals >= tier.minDeals) {
      badge = tier;
    }
  }
  return badge;
};

// ─── Method: Update badge ──────────────────────────────────────────────────
agentBadgeSchema.methods.updateBadge = async function () {
  const newBadge = await this.getBadgeForDeals(this.totalDeals);

  if (this.currentBadge.name !== newBadge.name) {
    this.badgeHistory.push({
      badgeName: newBadge.name,
      achievedAt: new Date(),
      dealsAtAchievement: this.totalDeals,
    });

    this.currentBadge = {
      name: newBadge.name,
      level: newBadge.level,
      color: newBadge.color,
      icon: newBadge.icon,
    };

    // Limit history to last 10 entries
    if (this.badgeHistory.length > 10) {
      this.badgeHistory = this.badgeHistory.slice(-10);
    }
  }

  return this;
};

// ─── Static: Get or create agent badge ─────────────────────────────────────
agentBadgeSchema.statics.getOrCreate = async function (agentId) {
  let agentBadge = await this.findOne({ agentId });
  if (!agentBadge) {
    agentBadge = await this.create({
      agentId,
      totalDeals: 0,
      salesDeals: 0,
      rentalDeals: 0,
      currentBadge: { name: 'Rookie', level: 1, color: '#22c55e', icon: '🌱' },
      badgeHistory: [],
    });
  }
  return agentBadge;
};

// ─── Static: Increment deal count ──────────────────────────────────────────
agentBadgeSchema.statics.incrementDeals = async function (agentId, dealType = 'rent') {
  const agentBadge = await this.getOrCreate(agentId);

  agentBadge.totalDeals += 1;
  if (dealType === 'sale') {
    agentBadge.salesDeals += 1;
  } else if (dealType === 'rent') {
    agentBadge.rentalDeals += 1;
  }

  await agentBadge.updateBadge();
   await agentBadge.save();
  return agentBadge;
};

// ─── Static: Get leaderboard ──────────────────────────────────────────────
agentBadgeSchema.statics.getLeaderboard = async function (limit = 50) {
  return this.find()
    .sort({ totalDeals: -1 })
    .limit(limit)
    .populate('agentId', 'fullName email mobile accountType')
    .lean();
};

module.exports = mongoose.model('AgentBadge', agentBadgeSchema);