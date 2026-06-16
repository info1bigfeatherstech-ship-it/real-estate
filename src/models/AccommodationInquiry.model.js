const mongoose = require('mongoose');
const {
  REQUIREMENT_TYPES,
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
  ATTACHMENT_KINDS,
} = require('../constants/accommodationInquiryEnums');

const attachmentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ATTACHMENT_KINDS, required: true },
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

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, trim: true, default: null },
    area: { type: String, trim: true, default: null },
    landmark: { type: String, trim: true, default: null },
  },
  { _id: false }
);

const accommodationInquirySchema = new mongoose.Schema(
  {
    inquiryRef: {
      type: String,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      maxlength: [20, 'Mobile number cannot exceed 20 characters'],
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [160, 'Email cannot exceed 160 characters'],
      default: null,
    },
    alternativeMobile: {
      type: String,
      trim: true,
      maxlength: [20, 'Alternative mobile cannot exceed 20 characters'],
      default: null,
    },
    requirementType: {
      type: String,
      enum: REQUIREMENT_TYPES,
      default: null,
      index: true,
    },
    occupantType: {
      type: String,
      enum: OCCUPANT_TYPES,
      default: null,
      index: true,
    },
    genderPreference: {
      type: String,
      enum: GENDER_PREFERENCES,
      default: null,
    },
    location: {
      type: locationSchema,
      default: null,
    },
    monthlyBudget: {
      type: String,
      enum: MONTHLY_BUDGETS,
      default: null,
      index: true,
    },
    propertyType: {
      type: String,
      enum: INQUIRY_PROPERTY_TYPES,
      default: null,
    },
    bhkRequirement: {
      type: String,
      enum: BHK_REQUIREMENTS,
      default: null,
    },
    tenantTypePreference: {
      type: String,
      enum: TENANT_TYPE_PREFERENCES,
      default: null,
    },
    foodPreference: {
      type: String,
      enum: INQUIRY_FOOD_PREFERENCES,
      default: null,
    },
    petPreference: {
      type: String,
      enum: INQUIRY_PET_PREFERENCES,
      default: null,
    },
    smokingPreference: {
      type: String,
      enum: INQUIRY_SMOKING_PREFERENCES,
      default: null,
    },
    alcoholPreference: {
      type: String,
      enum: INQUIRY_ALCOHOL_PREFERENCES,
      default: null,
    },
    sharingPreference: {
      type: String,
      enum: SHARING_PREFERENCES,
      default: null,
    },
    furnishingPreference: {
      type: String,
      enum: INQUIRY_FURNISHING_PREFERENCES,
      default: null,
    },
    amenitiesRequired: [{ type: String, enum: INQUIRY_AMENITIES }],
    moveInPriority: {
      type: String,
      enum: MOVE_IN_PRIORITIES,
      default: null,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [200, 'Remarks cannot exceed 200 characters'],
      default: null,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: null,
    },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      default: 'new',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
      default: null,
    },
    submittedAt: { type: Date, default: null },
    lastStatusUpdatedAt: { type: Date, default: null },
    lastStatusUpdatedBy: {
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

accommodationInquirySchema.index(
  {
    fullName: 'text',
    mobile: 'text',
    email: 'text',
    'location.city': 'text',
    'location.area': 'text',
    remarks: 'text',
    message: 'text',
  },
  {
    weights: {
      fullName: 10,
      mobile: 8,
      email: 5,
      'location.city': 6,
      'location.area': 6,
      remarks: 2,
      message: 2,
    },
  }
);
accommodationInquirySchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
accommodationInquirySchema.index({ isDeleted: 1, requirementType: 1, 'location.city': 1 });

accommodationInquirySchema.pre('save', function assignInquiryRef() {
  if (!this.inquiryRef) {
    const crypto = require('crypto');
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const numeric = Math.floor(10000 + Math.random() * 90000);
    this.inquiryRef = `INQ-${numeric}-${suffix}`;
  }
});

accommodationInquirySchema.pre('save', function normalizeOptionalFields() {
  if (this.email === '') this.email = null;
  if (this.alternativeMobile === '') this.alternativeMobile = null;
  if (this.remarks === '') this.remarks = null;
  if (this.message === '') this.message = null;
  if (this.adminNotes === '') this.adminNotes = null;
  if (this.location?.landmark === '') this.location.landmark = null;
});

accommodationInquirySchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('AccommodationInquiry', accommodationInquirySchema);
