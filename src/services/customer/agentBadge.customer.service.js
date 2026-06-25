const AgentBadge = require('../../models/AgentBadge.model');
const BadgeConfig = require('../../models/BadgeConfig.model');
const Customer = require('../../models/Customer.model');
const AppError = require('../../errors/AppError');

// ─── Get Agent Badge ────────────────────────────────────────────────────────
const getAgentBadge = async (agentId) => {
  let agentBadge = await AgentBadge.findOne({ agentId })
    .populate('agentId', 'fullName email mobile accountType');

  if (!agentBadge) {
    // Get config for next badge info
    const config = await BadgeConfig.getConfig();
    const nextBadge = config.tiers[0] || { name: 'Bronze', minDeals: 5 };

    return {
      agentId,
      totalDeals: 0,
      salesDeals: 0,
      rentalDeals: 0,
      currentBadge: { name: 'Rookie', level: 1, color: '#22c55e', icon: '🌱' },
      nextBadge: {
        name: nextBadge.name,
        minDeals: nextBadge.minDeals,
        dealsNeeded: nextBadge.minDeals,
      },
      badgeHistory: [],
      isNewAgent: true,
    };
  }

  // Get next badge info
  const config = await BadgeConfig.getConfig();
  const nextBadge = config.tiers.find(
    (tier) => tier.level === agentBadge.currentBadge.level + 1 && tier.isActive !== false
  );

  return {
    ...agentBadge.toObject(),
    nextBadge: nextBadge ? {
      name: nextBadge.name,
      minDeals: nextBadge.minDeals,
      dealsNeeded: Math.max(0, nextBadge.minDeals - agentBadge.totalDeals),
      icon: nextBadge.icon,
      color: nextBadge.color,
    } : null,
    isNewAgent: false,
  };
};

// ─── Increment Deal Count ──────────────────────────────────────────────────
const incrementDealCount = async (agentId, { propertyId, dealType = 'rent' }) => {
  // Validate agent exists and is an agent
  const agent = await Customer.findOne({
    _id: agentId,
    accountType: { $in: ['agent', 'owner'] },
    isActive: true,
  });

  if (!agent) {
    throw AppError.notFound('Agent not found');
  }

  const agentBadge = await AgentBadge.incrementDeals(agentId, dealType);
  return agentBadge;
};

// ─── Get Leaderboard ──────────────────────────────────────────────────────
const getLeaderboard = async (limit = 50) => {
  const leaderboard = await AgentBadge.getLeaderboard(limit);
  return leaderboard;
};

// ─── Get Badge History ─────────────────────────────────────────────────────
const getBadgeHistory = async (agentId) => {
  const agentBadge = await AgentBadge.findOne({ agentId });
  if (!agentBadge) {
    throw AppError.notFound('No badge history found for this agent');
  }
  return agentBadge.badgeHistory || [];
};

module.exports = {
  getAgentBadge,
  incrementDealCount,
  getLeaderboard,
  getBadgeHistory,
};