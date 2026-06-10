const LISTING_TYPES = Object.freeze(['For Sale', 'For Rent', 'BUY', 'PG']);

const RENTAL_LISTING_TYPES = Object.freeze(['For Rent', 'PG']);

const SALE_LISTING_TYPES = Object.freeze(['For Sale', 'BUY']);

const PROPERTY_TYPES = Object.freeze([
  'Flat',
  'Builder Floor',
  'Independent House',
  'Villa',
  'Penthouse',
  'Farmhouse',
  'Studio Apartment',
  'Office Space',
  'Shop',
  'Showroom',
  'Warehouse',
  'Factory',
  'Co-working Space',
  'Residential Plot',
  'Commercial Plot',
  'Agricultural Land',
  'Industrial Land',
]);

const OWNERSHIP_TYPES = Object.freeze([
  'Freehold',
  'Leasehold',
  'POA',
  'Co-operative Society',
]);

const PROPERTY_CONDITIONS = Object.freeze([
  'Brand New',
  'Excellent',
  'Good',
  'Average',
  'Needs Renovation',
]);

const CONSTRUCTION_STATUSES = Object.freeze(['Ready to Move', 'Under Construction']);

const FURNISHING_STATUSES = Object.freeze([
  'Unfurnished',
  'Semi-Furnished',
  'Fully Furnished',
]);

const FACING_DIRECTIONS = Object.freeze([
  'North',
  'South',
  'East',
  'West',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
]);

const FLOORING_TYPES = Object.freeze(['Marble', 'Granite', 'Wooden Flooring']);

const WATER_SUPPLY_TYPES = Object.freeze(['Municipal Water', 'Borewell', 'Both']);

const POWER_BACKUP_TYPES = Object.freeze(['No Backup', 'Full Backup']);

const PARKING_TYPES = Object.freeze([
  'No Parking',
  'Open Parking',
  'Covered Parking',
  'Basement Parking',
  'Stilt Parking',
]);

const SECURITY_FEATURES = Object.freeze(['CCTV', 'Security Guard', 'Gated Community']);

const AMENITIES = Object.freeze([
  'Lift',
  'Gym',
  'Swimming Pool',
  'Club House',
  'Park',
  'Kids Play Area',
  'Jogging Track',
  'Community Hall',
  'Visitor Parking',
  'EV Charging',
  'Temple',
  'Sports Court',
]);

const CONNECTIVITY = Object.freeze([
  'Near Metro',
  'Near Railway Station',
  'Near Airport',
  'Near Highway',
  'Near Bus Stand',
]);

const NEARBY_FACILITIES = Object.freeze([
  'School Nearby',
  'Hospital Nearby',
  'Market Nearby',
  'Mall Nearby',
  'Bank Nearby',
  'Park Nearby',
]);

const TENANT_TYPES = Object.freeze([
  'Family',
  'Bachelor Male',
  'Bachelor Female',
  'Students',
  'Working Professionals',
  'Business Owners',
  'Government Employees Only',
  'Corporate Lease',
  'Anyone',
]);

const OCCUPATION_PREFERENCES = Object.freeze([
  'Government Job Holders Only',
  'Private Employees Only',
  'Business Owners Only',
  'Self-Employed Only',
  'Students Only',
  'No Restriction',
]);

const EMPLOYMENT_VERIFICATION = Object.freeze([
  'Government ID',
  'Company ID',
  'Salary Slip',
  'Employment Letter',
]);

const RENTAL_AGREEMENT_DURATIONS = Object.freeze([
  '11 Months',
  '2 Years',
  '3 Years',
  'More Than 3 Years',
]);

const MINIMUM_STAY_DURATIONS = Object.freeze([
  '3 Months',
  '6 Months',
  '11 Months',
  '1 Year',
  '2 Years',
  'No Minimum',
]);

const LOCK_IN_PERIODS = Object.freeze([
  'No Lock-in',
  '3 Months',
  '6 Months',
  '11 Months',
  '1 Year',
]);

const AVAILABILITY_OPTIONS = Object.freeze([
  'Immediate',
  'Within 15 Days',
  'Within 30 Days',
  'Specific Date',
]);

const FOOD_PREFERENCES = Object.freeze([
  'Vegetarian Only',
  'Non-Vegetarian Allowed',
  'No Restriction',
]);

const POLICY_OPTIONS = Object.freeze(['Allowed', 'Not Allowed', 'Restricted']);

const TENANT_VERIFICATION = Object.freeze([
  'Aadhaar',
  'PAN',
  'Police Verification',
  'Employment Proof',
  'References',
  'No Verification',
]);

const SECURITY_DEPOSIT_OPTIONS = Object.freeze([
  '1 Month Rent',
  '2 Months Rent',
  '3 Months Rent',
  'Custom Amount',
]);

const POSSESSION_STATUSES = Object.freeze([
  'Immediate Possession',
  'Within 3 Months',
  'Within 6 Months',
  'Within 1 Year',
]);

const LOAN_AVAILABILITY = Object.freeze(['Available', 'Not Available']);

const PROPERTY_STATUSES = Object.freeze(['draft', 'active', 'pending', 'inactive']);

const MEDIA_TYPES = Object.freeze([
  'exterior',
  'livingRoom',
  'bedroom',
  'kitchen',
  'bathroom',
  'balcony',
  'society',
  'floorPlan',
  'video',
  'virtualTour',
]);

const DOCUMENT_CATEGORIES = Object.freeze([
  'identity',
  'ownership',
  'approval',
  'taxUtility',
  'legal',
]);

const IDENTITY_DOCUMENT_TYPES = Object.freeze([
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Driving Licence',
  'Voter ID',
]);

const OWNERSHIP_DOCUMENT_TYPES = Object.freeze([
  'Sale Deed',
  'Registry',
  'Conveyance Deed',
  'Mutation Certificate',
]);

const APPROVAL_DOCUMENT_TYPES = Object.freeze([
  'RERA Certificate',
  'Occupancy Certificate',
  'Completion Certificate',
  'Approved Building Plan',
]);

const TAX_UTILITY_DOCUMENT_TYPES = Object.freeze([
  'Property Tax Receipt',
  'Electricity Bill',
  'Water Bill',
]);

const LEGAL_DOCUMENT_TYPES = Object.freeze([
  'Encumbrance Certificate',
  'NOC',
  'Society Share Certificate',
  'Sale Deed',
]);

const ALL_DOCUMENT_TYPES = Object.freeze([
  ...IDENTITY_DOCUMENT_TYPES,
  ...OWNERSHIP_DOCUMENT_TYPES,
  ...APPROVAL_DOCUMENT_TYPES,
  ...TAX_UTILITY_DOCUMENT_TYPES,
  ...LEGAL_DOCUMENT_TYPES,
]);

module.exports = {
  LISTING_TYPES,
  RENTAL_LISTING_TYPES,
  SALE_LISTING_TYPES,
  PROPERTY_TYPES,
  OWNERSHIP_TYPES,
  PROPERTY_CONDITIONS,
  CONSTRUCTION_STATUSES,
  FURNISHING_STATUSES,
  FACING_DIRECTIONS,
  FLOORING_TYPES,
  WATER_SUPPLY_TYPES,
  POWER_BACKUP_TYPES,
  PARKING_TYPES,
  SECURITY_FEATURES,
  AMENITIES,
  CONNECTIVITY,
  NEARBY_FACILITIES,
  TENANT_TYPES,
  OCCUPATION_PREFERENCES,
  EMPLOYMENT_VERIFICATION,
  RENTAL_AGREEMENT_DURATIONS,
  MINIMUM_STAY_DURATIONS,
  LOCK_IN_PERIODS,
  AVAILABILITY_OPTIONS,
  FOOD_PREFERENCES,
  POLICY_OPTIONS,
  TENANT_VERIFICATION,
  SECURITY_DEPOSIT_OPTIONS,
  POSSESSION_STATUSES,
  LOAN_AVAILABILITY,
  PROPERTY_STATUSES,
  MEDIA_TYPES,
  DOCUMENT_CATEGORIES,
  IDENTITY_DOCUMENT_TYPES,
  OWNERSHIP_DOCUMENT_TYPES,
  APPROVAL_DOCUMENT_TYPES,
  TAX_UTILITY_DOCUMENT_TYPES,
  LEGAL_DOCUMENT_TYPES,
  ALL_DOCUMENT_TYPES,
};
