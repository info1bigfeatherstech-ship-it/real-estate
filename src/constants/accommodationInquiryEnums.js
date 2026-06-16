const REQUIREMENT_TYPES = Object.freeze([
  'Rental Property',
  'PG Accommodation',
  'Co-Living Accommodation',
]);

const RENTAL_REQUIREMENT_TYPES = Object.freeze(['Rental Property']);

const SHARING_REQUIREMENT_TYPES = Object.freeze(['PG Accommodation', 'Co-Living Accommodation']);

const OCCUPANT_TYPES = Object.freeze([
  'Student',
  'Working Professional',
  'Business Owner',
  'Family',
  'Couple',
  'Single Person',
]);

const GENDER_PREFERENCES = Object.freeze(['Male', 'Female', 'Unisex / No Preference']);

const MONTHLY_BUDGETS = Object.freeze([
  'Under ₹5,000',
  '₹5,000–10,000',
  '₹10,000–15,000',
  '₹15,000–25,000',
  '₹25,000–50,000',
  '₹50,000+',
]);

const INQUIRY_PROPERTY_TYPES = Object.freeze([
  'Flat / Apartment',
  'Independent House',
  'Studio Apartment',
  'Shop',
  'Office Space',
]);

const BHK_REQUIREMENTS = Object.freeze(['Studio', '1 BHK', '2 BHK', '3 BHK', '4+ BHK']);

const TENANT_TYPE_PREFERENCES = Object.freeze([
  'Only Families',
  'Bachelors Allowed',
  'Only Bachelors',
  'Married Couples Allowed',
  'Students Allowed',
  'Working Professionals Preferred',
  'Any',
]);

const INQUIRY_FOOD_PREFERENCES = Object.freeze([
  'Vegetarian Only',
  'Non-Vegetarian Allowed',
  'No Preference',
]);

const INQUIRY_PET_PREFERENCES = Object.freeze([
  'Pets Allowed',
  'Pets Not Allowed',
  'No Preference',
]);

const INQUIRY_SMOKING_PREFERENCES = Object.freeze([
  'Smoking Allowed',
  'Non-Smoking Property',
  'No Preference',
]);

const INQUIRY_ALCOHOL_PREFERENCES = Object.freeze(['Allowed', 'Not Allowed', 'No Preference']);

const SHARING_PREFERENCES = Object.freeze([
  'Single Occupancy',
  'Double Sharing',
  'Triple Sharing',
  'Quad Sharing',
  'Any',
]);

const INQUIRY_FURNISHING_PREFERENCES = Object.freeze([
  'Fully Furnished',
  'Semi-Furnished',
  'Unfurnished',
  'No Preference',
]);

const INQUIRY_AMENITIES = Object.freeze([
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

const MOVE_IN_PRIORITIES = Object.freeze([
  'Immediate',
  'Within 7 Days',
  'Within 15 Days',
  'Within 1 Month',
  'Within 3 Months',
  'Flexible',
]);

const INQUIRY_STATUSES = Object.freeze(['draft', 'new', 'contacted', 'converted', 'lost', 'closed']);

const ADMIN_INQUIRY_STATUSES = Object.freeze(['new', 'contacted', 'converted', 'lost', 'closed']);

const ATTACHMENT_KINDS = Object.freeze(['referenceImage', 'otherFile']);

const MAX_INQUIRY_REFERENCE_IMAGES = 10;
const MAX_INQUIRY_OTHER_FILES = 5;

module.exports = {
  REQUIREMENT_TYPES,
  RENTAL_REQUIREMENT_TYPES,
  SHARING_REQUIREMENT_TYPES,
  OCCUPANT_TYPES,
  GENDER_PREFERENCES,
  MONTHLY_BUDGETS,
  INQUIRY_PROPERTY_TYPES,
  BHK_REQUIREMENTS,
  TENANT_TYPE_PREFERENCES,
  INQUIRY_FOOD_PREFERENCES,
  INQUIRY_PET_PREFERENCES,
  INQUIRY_SMOKING_PREFERENCES,
  INQUIRY_ALCOHOL_PREFERENCES,
  SHARING_PREFERENCES,
  INQUIRY_FURNISHING_PREFERENCES,
  INQUIRY_AMENITIES,
  MOVE_IN_PRIORITIES,
  INQUIRY_STATUSES,
  ADMIN_INQUIRY_STATUSES,
  ATTACHMENT_KINDS,
  MAX_INQUIRY_REFERENCE_IMAGES,
  MAX_INQUIRY_OTHER_FILES,
};
