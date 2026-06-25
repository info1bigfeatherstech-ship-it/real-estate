const BadgeConfig = require('../../models/BadgeConfig.model');
const AgentBadge = require('../../models/AgentBadge.model');
const AppError = require('../../errors/AppError');

// ─── Get Badge Config ──────────────────────────────────────────────────────
const getConfig = async () => {
  const config = await BadgeConfig.getConfig();
  return config;
};

// ─── Update Full Config ────────────────────────────────────────────────────
const updateConfig = async (tiers, userId) => {
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    throw AppError.badRequest('At least one tier is required');
  }

  // Validate tier levels are unique
  const levels = tiers.map((t) => t.level);
  if (new Set(levels).size !== levels.length) {
    throw AppError.badRequest('Tier levels must be unique');
  }

  // Validate overlapping ranges
  const sorted = [...tiers].sort((a, b) => a.minDeals - b.minDeals);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].maxDeals !== null && sorted[i + 1].minDeals <= sorted[i].maxDeals) {
      throw AppError.badRequest('Tier ranges cannot overlap');
    }
  }

  let config = await BadgeConfig.findOne();
  if (!config) {
    config = await BadgeConfig.create({
      tiers,
      lastUpdatedBy: userId,
    });
  } else {
    config.tiers = tiers;
    config.lastUpdatedBy = userId;
    await config.save();
  }

  // Recalculate all agent badges
  await recalculateAllBadges();

  return config;
};

// ─── Add New Tier ──────────────────────────────────────────────────────────
const addTier = async (tierData, userId) => {
  const config = await BadgeConfig.getConfig();

  // Check if level already exists
  if (config.tiers.some((t) => t.level === tierData.level)) {
    throw AppError.conflict(`Level ${tierData.level} already exists`);
  }

  config.tiers.push({
    name: tierData.name,
    minDeals: tierData.minDeals,
    maxDeals: tierData.maxDeals || null,
    level: tierData.level,
    color: tierData.color || '#6b7280',
    icon: tierData.icon || '🏠',
    description: tierData.description || null,
    isActive: tierData.isActive !== undefined ? tierData.isActive : true,
  });

  config.tiers.sort((a, b) => a.level - b.level);
  config.lastUpdatedBy = userId;
  await config.save();

  await recalculateAllBadges();

  return config;
};

// ─── Update Tier ────────────────────────────────────────────────────────────
const updateTier = async (level, updates, userId) => {
  const config = await BadgeConfig.getConfig();
  const tierIndex = config.tiers.findIndex((t) => t.level === parseInt(level));

  if (tierIndex === -1) {
    throw AppError.notFound(`Tier with level ${level} not found`);
  }

  const tier = config.tiers[tierIndex];

  // Update fields
  if (updates.name) tier.name = updates.name;
  if (updates.minDeals !== undefined) tier.minDeals = updates.minDeals;
  if (updates.maxDeals !== undefined) tier.maxDeals = updates.maxDeals;
  if (updates.color) tier.color = updates.color;
  if (updates.icon) tier.icon = updates.icon;
  if (updates.description !== undefined) tier.description = updates.description;
  if (updates.isActive !== undefined) tier.isActive = updates.isActive;

  config.lastUpdatedBy = userId;
  await config.save();

  await recalculateAllBadges();

  return config;
};

// ─── Delete Tier ────────────────────────────────────────────────────────────
const deleteTier = async (level, userId) => {
  const config = await BadgeConfig.getConfig();

  if (config.tiers.length <= 1) {
    throw AppError.badRequest('Cannot delete the last tier');
  }

  const tierIndex = config.tiers.findIndex((t) => t.level === parseInt(level));
  if (tierIndex === -1) {
    throw AppError.notFound(`Tier with level ${level} not found`);
  }

  config.tiers.splice(tierIndex, 1);
  config.lastUpdatedBy = userId;
  await config.save();

  await recalculateAllBadges();

  return config;
};

// ─── Toggle Tier Status ────────────────────────────────────────────────────
const toggleTierStatus = async (level, isActive, userId) => {
  const config = await BadgeConfig.getConfig();
  const tierIndex = config.tiers.findIndex((t) => t.level === parseInt(level));

  if (tierIndex === -1) {
    throw AppError.notFound(`Tier with level ${level} not found`);
  }

  config.tiers[tierIndex].isActive = isActive;
  config.lastUpdatedBy = userId;
  await config.save();

  await recalculateAllBadges();

  return config;
};

// ─── Recalculate All Agent Badges ──────────────────────────────────────────
const recalculateAllBadges = async () => {
  const agents = await AgentBadge.find();
  for (const agent of agents) {
    await agent.updateBadge();
  }
};

module.exports = {
  getConfig,
  updateConfig,
  addTier,
  updateTier,
  deleteTier,
  toggleTierStatus,
  recalculateAllBadges,
};