// ─── Report Periods ────────────────────────────────────────────────────────

const REPORT_PERIODS = Object.freeze([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
]);

// ─── Report Types ─────────────────────────────────────────────────────────

const REPORT_TYPES = Object.freeze([
  'property_views',
  'leads',
  'revenue',
  'property_analysis',
  'customers',
]);

// ─── Report Formats ────────────────────────────────────────────────────────

const REPORT_FORMATS = Object.freeze([
  'json',
  'csv',
  'pdf',
]);

module.exports = {
  REPORT_PERIODS,
  REPORT_TYPES,
  REPORT_FORMATS,
};