// ─── Tenant Entry Enums ──────────────────────────────────────────────────

const OCCUPANT_TYPES = Object.freeze([
  'Family',
  'Bachelor',
  'Student',
  'Working Professional',
]);

const ENTRY_STATUSES = Object.freeze([
  'active',
  'completed',
  'disputed',
]);

// ─── Tenant Exit Enums ──────────────────────────────────────────────────

const EXIT_REASONS = Object.freeze([
  'Lease End',
  'Relocation',
  'Upgrade',
  'Personal Reasons',
  'Other',
]);

const HANDOVER_STATUSES = Object.freeze([
  'Completed Successfully',
  'Pending Verification',
  'Damage Dispute',
  'Deposit Hold',
]);

const CONDITION_OPTIONS = Object.freeze([
  'Excellent',
  'Good',
  'Minor Damage',
  'Major Damage',
]);

const YES_NO = Object.freeze(['Yes', 'No']);

// ─── Inventory Categories ──────────────────────────────────────────────────

const INVENTORY_CATEGORIES = Object.freeze([
  'Furniture',
  'Appliance',
  'Key',
  'Accessory',
  'Other',
]);

// ─── Default Inventory Items ──────────────────────────────────────────────

const DEFAULT_INVENTORY_ITEMS = Object.freeze([
  { name: 'Bed', category: 'Furniture' },
  { name: 'Mattress', category: 'Furniture' },
  { name: 'Pillow', category: 'Furniture' },
  { name: 'Study Table', category: 'Furniture' },
  { name: 'Chair', category: 'Furniture' },
  { name: 'Wardrobe', category: 'Furniture' },
  { name: 'Sofa', category: 'Furniture' },
  { name: 'Dining Table', category: 'Furniture' },
  { name: 'TV Unit', category: 'Furniture' },
  { name: 'Curtains', category: 'Furniture' },
  { name: 'Mirror', category: 'Furniture' },
  { name: 'AC', category: 'Appliance' },
  { name: 'Fan', category: 'Appliance' },
  { name: 'Refrigerator', category: 'Appliance' },
  { name: 'Washing Machine', category: 'Appliance' },
  { name: 'Geyser', category: 'Appliance' },
  { name: 'Microwave', category: 'Appliance' },
  { name: 'Induction', category: 'Appliance' },
  { name: 'RO Water Purifier', category: 'Appliance' },
  { name: 'Television', category: 'Appliance' },
  { name: 'Wi-Fi Router', category: 'Appliance' },
  { name: 'Main Door Key', category: 'Key' },
  { name: 'Room Key', category: 'Key' },
  { name: 'Cupboard Key', category: 'Key' },
  { name: 'Drawer Key', category: 'Key' },
  { name: 'Access Card', category: 'Accessory' },
  { name: 'Parking Remote', category: 'Accessory' },
]);

module.exports = {
  OCCUPANT_TYPES,
  ENTRY_STATUSES,
  EXIT_REASONS,
  HANDOVER_STATUSES,
  CONDITION_OPTIONS,
  YES_NO,
  INVENTORY_CATEGORIES,
  DEFAULT_INVENTORY_ITEMS,
};