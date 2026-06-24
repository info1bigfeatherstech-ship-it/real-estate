// ─── Key Types ──────────────────────────────────────────────────────────────

const KEY_TYPES = Object.freeze([
  'Main Door',
  'Room',
  'Cupboard',
  'Drawer',
  'Access Card',
  'Parking Remote',
  'Other',
]);

// ─── Key Status ─────────────────────────────────────────────────────────────

const KEY_STATUS = Object.freeze([
  'with_person',   // Key kisike paas hai
  'returned',      // Key wapas aa gayi
  'lost',          // Key lost
  'damaged',       // Key damaged
]);

// ─── Person Types ──────────────────────────────────────────────────────────

const PERSON_TYPES = Object.freeze([
  'owner',
  'agent',
  'manager',
  'tenant',
  'staff',
  'other',
]);

module.exports = {
  KEY_TYPES,
  KEY_STATUS,
  PERSON_TYPES,
};