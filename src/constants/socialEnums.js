// ─── Social Platforms ──────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = Object.freeze([
  'facebook',
  'instagram',
  'youtube',
  'linkedin',
  'twitter',
  'whatsapp',
  'telegram',
  'other',
]);

// ─── Platform Icons ──────────────────────────────────────────────────────

const PLATFORM_ICONS = Object.freeze({
  facebook: '📘',
  instagram: '📸',
  youtube: '▶️',
  linkedin: '💼',
  twitter: '🐦',
  whatsapp: '💬',
  telegram: '✈️',
  other: '🔗',
});

// ─── Platform Labels ──────────────────────────────────────────────────────

const PLATFORM_LABELS = Object.freeze({
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  other: 'Other',
});

// ─── Share URL Templates ──────────────────────────────────────────────────

const SHARE_URL_TEMPLATES = Object.freeze({
  facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
  twitter: 'https://twitter.com/intent/tweet?url=',
  linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=',
  whatsapp: 'https://api.whatsapp.com/send?text=',
  telegram: 'https://t.me/share/url?url=',
});

module.exports = {
  SOCIAL_PLATFORMS,
  PLATFORM_ICONS,
  PLATFORM_LABELS,
  SHARE_URL_TEMPLATES,
};