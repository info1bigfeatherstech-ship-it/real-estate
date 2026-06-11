const mongoose = require('mongoose');
const {
  LISTING_TYPES,
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
  ALL_DOCUMENT_TYPES,
} = require('../constants/propertyEnums');
const { INDIAN_STATE_NAMES } = require('../constants/indianStateCodes');

const mediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: MEDIA_TYPES, required: true },
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    originalFileName: { type: String, default: null },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    storageKey: { type: String, required: true },
    storageProvider: { type: String, enum: ['local', 'cloudinary', 'r2'], required: true },
    isMain: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const documentSchema = new mongoose.Schema(
  {
    category: { type: String, enum: DOCUMENT_CATEGORIES, required: true },
    type: { type: String, enum: ALL_DOCUMENT_TYPES, required: true },
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    originalFileName: { type: String, default: null },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    storageKey: { type: String, required: true },
    storageProvider: { type: String, enum: ['local', 'cloudinary', 'r2'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const rentalDetailsSchema = new mongoose.Schema(
  {
    tenantTypeAllowed: [{ type: String, enum: TENANT_TYPES }],
    occupationPreference: { type: String, enum: OCCUPATION_PREFERENCES, default: null },
    employmentVerification: [{ type: String, enum: EMPLOYMENT_VERIFICATION }],
    rentalAgreementDuration: { type: String, enum: RENTAL_AGREEMENT_DURATIONS, default: null },
    minimumStayDuration: { type: String, enum: MINIMUM_STAY_DURATIONS, default: null },
    lockInPeriod: { type: String, enum: LOCK_IN_PERIODS, default: null },
    availability: { type: String, enum: AVAILABILITY_OPTIONS, default: null },
    availabilityDate: { type: Date, default: null },
    foodPreference: { type: String, enum: FOOD_PREFERENCES, default: null },
    pets: { type: String, enum: POLICY_OPTIONS, default: null },
    smoking: { type: String, enum: POLICY_OPTIONS, default: null },
    alcohol: { type: String, enum: POLICY_OPTIONS, default: null },
    guestPolicy: { type: String, enum: POLICY_OPTIONS, default: null },
    tenantVerification: [{ type: String, enum: TENANT_VERIFICATION }],
    securityDeposit: { type: String, enum: SECURITY_DEPOSIT_OPTIONS, default: null },
    securityDepositCustomAmount: { type: Number, default: null, min: 0 },
    preferredMoveInDate: { type: String, enum: AVAILABILITY_OPTIONS, default: null },
    preferredMoveInDateSpecific: { type: Date, default: null },
    governmentEmployeePreferred: { type: Boolean, default: false },
  },
  { _id: false }
);

const saleDetailsSchema = new mongoose.Schema(
  {
    possessionStatus: { type: String, enum: POSSESSION_STATUSES, default: null },
    loanAvailability: { type: String, enum: LOAN_AVAILABILITY, default: null },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    fullAddress: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, enum: [...INDIAN_STATE_NAMES, null], default: null },
    pincode: { type: String, trim: true, match: [/^\d{6}$/, 'Pincode must be 6 digits'], default: null },
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    listingId: {
      type: String,
      unique: true,
    },
    listingType: {
      type: String,
      enum: LISTING_TYPES,
      required: [true, 'Listing type is required'],
      index: true,
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: [true, 'Property type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
      default: '',
    },
    ownershipType: {
      type: String,
      enum: OWNERSHIP_TYPES,
      default: null,
    },
    condition: { type: String, enum: PROPERTY_CONDITIONS, default: null },
    constructionStatus: { type: String, enum: CONSTRUCTION_STATUSES, default: null },
    furnishing: { type: String, enum: FURNISHING_STATUSES, default: null },
    facing: { type: String, enum: FACING_DIRECTIONS, default: null },
    flooringType: { type: String, enum: FLOORING_TYPES, default: null },
    area: {
      value: { type: Number, min: 0, default: null },
      unit: { type: String, enum: ['sqft'], default: 'sqft' },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      index: true,
    },
    maintenance: { type: Number, min: 0, default: null },
    bedrooms: { type: Number, min: 0, default: null },
    bathrooms: { type: Number, min: 0, default: null },
    floorNo: { type: Number, min: 0, default: null },
    totalFloors: { type: Number, min: 0, default: null },
    waterSupply: { type: String, enum: WATER_SUPPLY_TYPES, default: null },
    powerBackup: { type: String, enum: POWER_BACKUP_TYPES, default: null },
    parkingType: { type: String, enum: PARKING_TYPES, default: null },
    securityFeatures: [{ type: String, enum: SECURITY_FEATURES }],
    amenities: [{ type: String, enum: AMENITIES }],
    connectivity: [{ type: String, enum: CONNECTIVITY }],
    nearbyFacilities: [{ type: String, enum: NEARBY_FACILITIES }],
    rentalDetails: { type: rentalDetailsSchema, default: null },
    saleDetails: { type: saleDetailsSchema, default: null },
    location: { type: locationSchema, default: () => ({}) },
    media: [mediaSchema],
    documents: [documentSchema],
    status: {
      type: String,
      enum: PROPERTY_STATUSES,
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

propertySchema.index({ title: 'text', 'location.city': 'text', 'location.fullAddress': 'text' });
propertySchema.index({ listingType: 1, propertyType: 1, status: 1, isDeleted: 1 });
propertySchema.index({ 'location.city': 1, 'location.state': 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ status: 1, isDeleted: 1, publishedAt: -1 });
propertySchema.index({ status: 1, isDeleted: 1, listingType: 1, propertyType: 1, price: 1 });
propertySchema.index({ status: 1, isDeleted: 1, 'location.city': 1, 'location.state': 1, price: 1 });
propertySchema.index({ status: 1, isDeleted: 1, bedrooms: 1, price: 1 });

propertySchema.virtual('mainImage').get(function mainImage() {
  const main = this.media?.find((m) => m.isMain);
  return main?.url || this.media?.[0]?.url || null;
});

propertySchema.pre('save', function assignListingId() {
  if (!this.listingId) {
    const crypto = require('crypto');
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const numeric = Math.floor(10000 + Math.random() * 90000);
    this.listingId = `EA-${numeric}-${suffix}`;
  }
});

propertySchema.pre('save', function handlePublishDate() {
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

propertySchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('Property', propertySchema);
