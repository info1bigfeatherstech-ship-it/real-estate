const mongoose = require('mongoose');

const GENERAL_INQUIRY_STATUSES = ['new', 'read', 'contacted', 'archived'];

const generalInquirySchema = new mongoose.Schema(
  {
    // ─── User Details ──────────────────────────────────────────────────────
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
      index: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      maxlength: [20, 'Contact number cannot exceed 20 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [160, 'Email cannot exceed 160 characters'],
      default: null,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
      default: null,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },

    // ─── Source ────────────────────────────────────────────────────────────
    source: {
      type: String,
      enum: ['website', 'mobile_app', 'whatsapp', 'other'],
      default: 'website',
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: [45, 'IP address cannot exceed 45 characters'],
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters'],
      default: null,
    },
    referrer: {
      type: String,
      trim: true,
      maxlength: [500, 'Referrer cannot exceed 500 characters'],
      default: null,
    },

    // ─── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: GENERAL_INQUIRY_STATUSES,
      default: 'new',
      index: true,
    },

    // ─── Admin Notes ──────────────────────────────────────────────────────
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
      default: null,
    },

    // ─── System Fields ────────────────────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
generalInquirySchema.index({ fullName: 'text', city: 'text', message: 'text' });
generalInquirySchema.index({ status: 1, createdAt: -1 });
generalInquirySchema.index({ contactNumber: 1 });

// ─── Query Helpers ──────────────────────────────────────────────────────
generalInquirySchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('GeneralInquiry', generalInquirySchema);