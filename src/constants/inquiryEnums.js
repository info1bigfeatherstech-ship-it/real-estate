const accommodationInquiryEnums = require('./accommodationInquiryEnums');

const INQUIRY_FORM_TYPES = Object.freeze([
  'accommodation_requirement',
  'accommodation_listing',
  'buy_property',
  'sell_property',
]);

const INQUIRY_FORM_TYPE_LABELS = Object.freeze({
  accommodation_requirement: 'Accommodation Requirement',
  accommodation_listing: 'Accommodation Listing',
  buy_property: 'Buy Property',
  sell_property: 'Sell Property',
});

const INQUIRY_STATUSES = Object.freeze([
  'draft',
  'new',
  'assigned',
  'contacted',
  'follow_up_required',
  'property_shared',
  'site_visit_scheduled',
  'site_visit_completed',
  'negotiation',
  'documentation_pending',
  'converted',
  'closed',
  'rejected',
  'lost',
]);

const ADMIN_INQUIRY_STATUSES = Object.freeze(
  INQUIRY_STATUSES.filter((s) => s !== 'draft')
);

const INQUIRY_PRIORITIES = Object.freeze(['high', 'medium', 'low']);

const INQUIRY_SOURCES = Object.freeze([
  'website',
  'mobile_app',
  'whatsapp',
  'phone_call',
  'walk_in',
  'facebook',
  'instagram',
  'google_ads',
  'referral',
  'broker',
  'other',
]);

// ── Buy property enums ──
const BUY_PROPERTY_TYPES = Object.freeze([
  'Flat / Apartment',
  'Independent House',
  'Plot / Land',
  'Farm House',
  'Shop',
  'Office Space',
  'Warehouse',
  'Commercial Property',
  'Industrial Property',
  'Other',
]);

const INTENDED_USES = Object.freeze([
  'Self Use',
  'Investment',
  'Rental Income',
  'Office',
  'Retail Shop',
  'Restaurant / Cafe',
  'Bank Branch',
  'ATM',
  'Gym / Fitness Center',
  'Clinic / Hospital',
  'Pharmacy',
  'Showroom',
  'Warehouse / Storage',
  'Educational Institute',
  'Hotel / Guest House',
  'Co-Living',
  'PG',
  'Other',
]);

const BUY_BUDGET_RANGES = Object.freeze([
  'Under ₹25 Lakh',
  '₹25–50 Lakh',
  '₹50 Lakh–1 Crore',
  '₹1–2 Crore',
  '₹2–5 Crore',
  'Above ₹5 Crore',
]);

const BUY_BHK_REQUIREMENTS = Object.freeze(['Studio', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK']);

const AREA_UNITS = Object.freeze(['Sq. Ft.', 'Sq. Yard', 'Acre', 'Hectare']);

const PROPERTY_STATUS_PREFERENCES = Object.freeze([
  'Ready to Move',
  'Under Construction',
  'Newly Launched',
  'Any',
]);

const BUY_PRIORITY_TIMELINES = Object.freeze([
  'Immediate (Within 7 Days)',
  'Within 15 Days',
  'Within 1 Month',
  'Within 3 Months',
  'Within 6 Months',
  'Just Exploring',
]);

const BUY_AMENITIES = Object.freeze([
  'Parking',
  'Lift',
  'Security',
  'CCTV',
  'Power Backup',
  'Garden',
  'Club House',
  'Gym',
  'Swimming Pool',
  "Children's Play Area",
]);

// ── Sell property enums ──
const SELL_PROPERTY_TYPES = Object.freeze([
  'Flat / Apartment',
  'Independent House',
  'Plot / Land',
  'Farm House',
  'Shop',
  'Office Space',
  'Warehouse',
  'Commercial Property',
  'Industrial Property',
]);

const PROPERTY_SUITABLE_FOR = Object.freeze([
  'Residential Use',
  'Office',
  'Retail Shop',
  'Restaurant / Cafe',
  'Bank Branch',
  'ATM',
  'Gym / Fitness Center',
  'Salon / Spa',
  'Clinic',
  'Hospital',
  'Pharmacy',
  'Coaching Institute',
  'School',
  'Showroom',
  'Warehouse',
  'Manufacturing Unit',
  'Co-Living',
  'PG',
  'Hostel',
  'Hotel / Guest House',
  'Multiple Uses',
]);

const SELL_BHK_OPTIONS = Object.freeze([
  'Studio',
  '1 BHK',
  '2 BHK',
  '3 BHK',
  '4 BHK',
  '5+ BHK',
  'Not Applicable',
]);

const FACING_DIRECTIONS = Object.freeze([
  'East',
  'West',
  'North',
  'South',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
]);

const SELL_PROPERTY_CONDITIONS = Object.freeze([
  'Ready to Move',
  'Under Construction',
  'Resale',
  'New Property',
]);

const OWNERSHIP_TYPES = Object.freeze([
  'Self Owned',
  'Joint Ownership',
  'Company Owned',
  'Partnership Owned',
  'Builder Owned',
  'Inherited Property',
  'Power of Attorney Holder',
  'Other',
]);

const LEGAL_DOCUMENT_TYPES = Object.freeze([
  'Registered Sale Deed (Registry)',
  'Agreement to Sell',
  'Conveyance Deed',
  'Gift Deed',
  'Builder Buyer Agreement',
  'Allotment Letter',
  'Possession Letter',
  'GPA (General Power of Attorney)',
  'Will Based Property',
  'Inherited Property Documents',
  'Government Lease Property',
  'Company Ownership Documents',
  'Lease Deed',
  'Rent Agreement',
  'Other',
]);

const TITLE_STATUSES = Object.freeze([
  'Clear Title',
  'Encumbered',
  'Under Verification',
  'To Be Discussed',
]);

const ADDITIONAL_DOCUMENTS = Object.freeze([
  'Title Deed',
  'Occupancy Certificate (OC)',
  'Completion Certificate (CC)',
  'Approved Building Plan',
  'Building Approval / Sanction Plan',
  'RERA Registration Certificate',
  'NOC',
  'Property Tax Receipt',
  'Electricity Bill',
  'Water Bill',
  'Mutation Certificate',
  'Khata Certificate',
  'Khata Extract',
  'Patta',
  'Encumbrance Certificate (EC)',
  'Society Share Certificate',
  'Fire NOC',
  'Trade License',
  'GST Registration',
  'Business License',
  'Other',
]);

const DOCUMENT_STATUSES = Object.freeze([
  'All Documents Available',
  'Most Documents Available',
  'Some Documents Available',
  'Documents Under Process',
  'Documents Not Available',
  'To Be Discussed',
]);

const SELL_PRIORITY_TIMELINES = Object.freeze([
  'Immediate',
  'Within 15 Days',
  'Within 1 Month',
  'Within 3 Months',
  'Within 6 Months',
  'No Fixed Timeline',
]);

const YES_NO = Object.freeze(['Yes', 'No']);

// ── Accommodation listing enums ──
const LISTING_TYPES = Object.freeze([
  'Rental Property',
  'PG Accommodation',
  'Co-Living Accommodation',
]);

const LISTING_PROPERTY_TYPES = Object.freeze([
  'Flat / Apartment',
  'Independent House',
  'Studio Apartment',
  'PG',
  'Co-Living',
]);

const OCCUPANT_SUITABILITY = Object.freeze([
  'Families',
  'Bachelors',
  'Students',
  'Working Professionals',
  'Corporate Leasing',
  'Male Occupants',
  'Female Occupants',
  'Couples',
  'Any',
]);

const BUSINESS_USE_TYPES = Object.freeze([
  'Office',
  'Retail Shop',
  'Restaurant / Cafe',
  'Bank Branch',
  'ATM',
  'Gym',
  'Salon / Spa',
  'Clinic',
  'Pharmacy',
  'Coaching Institute',
  'Warehouse',
  'Showroom',
  'Not Applicable',
]);

const LISTING_AREA_UNITS = Object.freeze(['Sq. Ft.', 'Sq. Yard']);

const LISTING_BHK_OPTIONS = Object.freeze([
  'Studio',
  '1 BHK',
  '2 BHK',
  '3 BHK',
  '4+ BHK',
  'Not Applicable',
]);

const AVAILABLE_FROM_OPTIONS = Object.freeze([
  'Immediately Available',
  'Within 7 Days',
  'Within 15 Days',
  'Within 1 Month',
  'Specific Date',
]);

const LISTING_URGENCY_OPTIONS = Object.freeze([
  'Need Tenant Immediately',
  'Within 15 Days',
  'Within 1 Month',
  'Within 3 Months',
  'No Hurry',
]);

const LISTING_AMENITIES = Object.freeze([
  'Wi-Fi',
  'AC',
  'Food / Mess',
  'Housekeeping',
  'Laundry',
  'Lift',
  'Parking',
  'Security',
  'CCTV',
  'Power Backup',
  'RO Water',
  'Attached Washroom',
  'Gym',
  'Study Area',
  'Balcony',
]);

const MAX_INQUIRY_ATTACHMENTS = 20;
const MAX_INQUIRY_ATTACHMENT_SIZE_MB = 15;

module.exports = {
  ...accommodationInquiryEnums,
  INQUIRY_FORM_TYPES,
  INQUIRY_FORM_TYPE_LABELS,
  INQUIRY_STATUSES,
  ADMIN_INQUIRY_STATUSES,
  INQUIRY_PRIORITIES,
  INQUIRY_SOURCES,
  BUY_PROPERTY_TYPES,
  INTENDED_USES,
  BUY_BUDGET_RANGES,
  BUY_BHK_REQUIREMENTS,
  AREA_UNITS,
  PROPERTY_STATUS_PREFERENCES,
  BUY_PRIORITY_TIMELINES,
  BUY_AMENITIES,
  SELL_PROPERTY_TYPES,
  PROPERTY_SUITABLE_FOR,
  SELL_BHK_OPTIONS,
  FACING_DIRECTIONS,
  SELL_PROPERTY_CONDITIONS,
  OWNERSHIP_TYPES,
  LEGAL_DOCUMENT_TYPES,
  TITLE_STATUSES,
  ADDITIONAL_DOCUMENTS,
  DOCUMENT_STATUSES,
  SELL_PRIORITY_TIMELINES,
  YES_NO,
  LISTING_TYPES,
  LISTING_PROPERTY_TYPES,
  OCCUPANT_SUITABILITY,
  BUSINESS_USE_TYPES,
  LISTING_AREA_UNITS,
  LISTING_BHK_OPTIONS,
  AVAILABLE_FROM_OPTIONS,
  LISTING_URGENCY_OPTIONS,
  LISTING_AMENITIES,
  MAX_INQUIRY_ATTACHMENTS,
  MAX_INQUIRY_ATTACHMENT_SIZE_MB,
};
