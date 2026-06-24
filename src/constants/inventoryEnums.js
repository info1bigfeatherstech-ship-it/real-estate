// ─── Default Categories ────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = Object.freeze([
  'Furniture',
  'Appliance',
  'Key',
  'Accessory',
  'Other',
]);

// ─── For backward compatibility ──────────────────────────────────────────
const INVENTORY_CATEGORIES = DEFAULT_CATEGORIES;

module.exports = {
  DEFAULT_CATEGORIES,
  INVENTORY_CATEGORIES,
};