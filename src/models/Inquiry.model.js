const mongoose = require('mongoose');
const {
  INQUIRY_FORM_TYPES,
  INQUIRY_STATUSES,
  INQUIRY_PRIORITIES,
  INQUIRY_SOURCES,
} = require('../constants/inquiryEnums');
const { CUSTOMER_ACCOUNT_TYPES } = require('../constants/customerAccountTypes');

const attachmentSchema = new mongoose.Schema(
  {
    category: { type: String, trim: true, default: 'other' },
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
    address: { type: String, trim: true, default: null },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, required: true, maxlength: 120 },
    mobile: { type: String, trim: true, required: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true, maxlength: 160, default: null },
    alternativeMobile: { type: String, trim: true, maxlength: 20, default: null },
  },
  { _id: false }
);

const inquirySchema = new mongoose.Schema(
  {
    inquiryRef: {
      type: String,
      unique: true,
      index: true,
    },
    formType: {
      type: String,
      enum: INQUIRY_FORM_TYPES,
      required: true,
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    submitterAccountType: {
      type: String,
      enum: CUSTOMER_ACCOUNT_TYPES,
      default: null,
      index: true,
    },
    contact: {
      type: contactSchema,
      required: true,
    },
    location: {
      type: locationSchema,
      default: null,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [2000, 'Remarks cannot exceed 2000 characters'],
      default: null,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
      default: null,
    },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      default: 'new',
      index: true,
    },
    priority: {
      type: String,
      enum: INQUIRY_PRIORITIES,
      default: 'medium',
      index: true,
    },
    inquirySource: {
      type: String,
      enum: INQUIRY_SOURCES,
      default: 'website',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
      default: null,
    },
    internalRemarks: {
      type: String,
      trim: true,
      maxlength: [2000, 'Internal remarks cannot exceed 2000 characters'],
      default: null,
    },
    followUpNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Follow-up notes cannot exceed 2000 characters'],
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
    legacyAccommodationInquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inquirySchema.index(
  {
    inquiryRef: 'text',
    'contact.fullName': 'text',
    'contact.mobile': 'text',
    'contact.email': 'text',
    'location.city': 'text',
    'location.area': 'text',
    remarks: 'text',
    message: 'text',
  },
  {
    weights: {
      inquiryRef: 10,
      'contact.fullName': 8,
      'contact.mobile': 8,
      'contact.email': 5,
      'location.city': 6,
      'location.area': 6,
      remarks: 2,
      message: 2,
    },
  }
);

inquirySchema.index({ isDeleted: 1, formType: 1, status: 1, createdAt: -1 });
inquirySchema.index({ isDeleted: 1, 'location.city': 1, formType: 1 });

inquirySchema.pre('save', function assignInquiryRef() {
  if (!this.inquiryRef) {
    const crypto = require('crypto');
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const numeric = Math.floor(10000 + Math.random() * 90000);
    this.inquiryRef = `INQ-${numeric}-${suffix}`;
  }
});

inquirySchema.pre('save', function normalizeOptionalFields() {
  if (this.remarks === '') this.remarks = null;
  if (this.message === '') this.message = null;
  if (this.adminNotes === '') this.adminNotes = null;
  if (this.internalRemarks === '') this.internalRemarks = null;
  if (this.followUpNotes === '') this.followUpNotes = null;
  if (this.location?.landmark === '') this.location.landmark = null;
  if (this.location?.address === '') this.location.address = null;
  if (this.contact?.email === '') this.contact.email = null;
  if (this.contact?.alternativeMobile === '') this.contact.alternativeMobile = null;
});

inquirySchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('Inquiry', inquirySchema);
