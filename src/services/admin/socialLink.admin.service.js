const SocialLink = require('../../models/SocialLink.model');
const AppError = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { escapeRegex } = require('../../utils/regex');
const { PLATFORM_LABELS, PLATFORM_ICONS } = require('../../constants/socialEnums');

const populateFields = [
  { path: 'createdBy', select: 'name email role' },
  { path: 'lastUpdatedBy', select: 'name email role' },
];

// ─── List Social Links ────────────────────────────────────────────────────
const listSocialLinks = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(query);
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [links, total] = await Promise.all([
    SocialLink.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateFields)
      .lean(),
    SocialLink.countDocuments(filter),
  ]);

  // Add platform labels and icons
  const enrichedLinks = links.map((link) => ({
    ...link,
    platformLabel: PLATFORM_LABELS[link.platform] || link.platform,
    defaultIcon: PLATFORM_ICONS[link.platform] || '🔗',
  }));

  return {
    links: enrichedLinks,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const buildListFilter = ({ search, platform, isActive }) => {
  const filter = { isDeleted: false };

  if (platform) filter.platform = platform;
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { platform: pattern },
      { label: pattern },
      { url: pattern },
    ];
  }

  return filter;
};

// ─── Get Social Link by ID ──────────────────────────────────────────────
const getSocialLinkById = async (linkId) => {
  const link = await SocialLink.findOne({
    _id: linkId,
    isDeleted: false,
  }).populate(populateFields);

  if (!link) {
    throw AppError.notFound('Social link not found');
  }

  return {
    ...link.toObject(),
    platformLabel: PLATFORM_LABELS[link.platform] || link.platform,
    defaultIcon: PLATFORM_ICONS[link.platform] || '🔗',
  };
};

// ─── Create Social Link ──────────────────────────────────────────────────
const createSocialLink = async (data, userId) => {
  // Check if platform already exists
  const existing = await SocialLink.findOne({
    platform: data.platform,
    isDeleted: false,
  });

  if (existing) {
    throw AppError.conflict(`Social link for "${data.platform}" already exists`);
  }

  const link = await SocialLink.create({
    platform: data.platform,
    label: data.label || null,
    url: data.url,
    icon: data.icon || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    displayOrder: data.displayOrder || 0,
    createdBy: userId,
    lastUpdatedBy: userId,
  });

  return {
    ...link.toObject(),
    platformLabel: PLATFORM_LABELS[link.platform] || link.platform,
    defaultIcon: PLATFORM_ICONS[link.platform] || '🔗',
  };
};

// ─── Update Social Link ──────────────────────────────────────────────────
const updateSocialLink = async (linkId, data, userId) => {
  const link = await SocialLink.findOne({
    _id: linkId,
    isDeleted: false,
  });

  if (!link) {
    throw AppError.notFound('Social link not found');
  }

  // If platform is being changed, check uniqueness
  if (data.platform && data.platform !== link.platform) {
    const existing = await SocialLink.findOne({
      platform: data.platform,
      isDeleted: false,
      _id: { $ne: linkId },
    });
    if (existing) {
      throw AppError.conflict(`Social link for "${data.platform}" already exists`);
    }
  }

  // Update fields
  if (data.platform) link.platform = data.platform;
  if (data.label !== undefined) link.label = data.label || null;
  if (data.url) link.url = data.url;
  if (data.icon !== undefined) link.icon = data.icon || null;
  if (data.isActive !== undefined) link.isActive = data.isActive;
  if (data.displayOrder !== undefined) link.displayOrder = data.displayOrder;

  link.lastUpdatedBy = userId;
  await link.save();

  return {
    ...link.toObject(),
    platformLabel: PLATFORM_LABELS[link.platform] || link.platform,
    defaultIcon: PLATFORM_ICONS[link.platform] || '🔗',
  };
};

// ─── Toggle Social Link Status ──────────────────────────────────────────
const toggleSocialLinkStatus = async (linkId, isActive, userId) => {
  const link = await SocialLink.findOne({
    _id: linkId,
    isDeleted: false,
  });

  if (!link) {
    throw AppError.notFound('Social link not found');
  }

  link.isActive = isActive;
  link.lastUpdatedBy = userId;
  await link.save();

  return {
    ...link.toObject(),
    platformLabel: PLATFORM_LABELS[link.platform] || link.platform,
    defaultIcon: PLATFORM_ICONS[link.platform] || '🔗',
  };
};

// ─── Delete Social Link ──────────────────────────────────────────────────
const deleteSocialLink = async (linkId) => {
  const link = await SocialLink.findOne({
    _id: linkId,
    isDeleted: false,
  });

  if (!link) {
    throw AppError.notFound('Social link not found');
  }

  link.isDeleted = true;
  link.deletedAt = new Date();
  link.isActive = false;
  await link.save();

  return link;
};

module.exports = {
  listSocialLinks,
  getSocialLinkById,
  createSocialLink,
  updateSocialLink,
  toggleSocialLinkStatus,
  deleteSocialLink,
};