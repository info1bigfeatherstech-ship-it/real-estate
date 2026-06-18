/**
 * Migrates legacy AccommodationInquiry documents into the unified Inquiry collection.
 * Safe to run multiple times — skips records already linked via legacyAccommodationInquiryId.
 *
 * Usage: node scripts/migrateAccommodationToInquiry.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const AccommodationInquiry = require('../src/models/AccommodationInquiry.model');
const Inquiry = require('../src/models/Inquiry.model');
const env = require('../src/config/env');

const migrate = async () => {
  await mongoose.connect(env.mongodbUri);

  const legacyRecords = await AccommodationInquiry.find({ isDeleted: false }).lean();
  let migrated = 0;
  let skipped = 0;

  for (const record of legacyRecords) {
    const exists = await Inquiry.findOne({ legacyAccommodationInquiryId: record._id });
    if (exists) {
      skipped += 1;
      continue;
    }

    await Inquiry.create({
      inquiryRef: record.inquiryRef,
      formType: 'accommodation_requirement',
      submittedBy: null,
      submitterAccountType: null,
      contact: {
        fullName: record.fullName,
        mobile: record.mobile,
        email: record.email,
        alternativeMobile: record.alternativeMobile,
      },
      location: record.location,
      payload: {
        requirementType: record.requirementType,
        occupantType: record.occupantType,
        genderPreference: record.genderPreference,
        monthlyBudget: record.monthlyBudget,
        propertyType: record.propertyType,
        bhkRequirement: record.bhkRequirement,
        tenantTypePreference: record.tenantTypePreference,
        foodPreference: record.foodPreference,
        petPreference: record.petPreference,
        smokingPreference: record.smokingPreference,
        alcoholPreference: record.alcoholPreference,
        sharingPreference: record.sharingPreference,
        furnishingPreference: record.furnishingPreference,
        amenitiesRequired: record.amenitiesRequired || [],
        moveInPriority: record.moveInPriority,
      },
      remarks: record.remarks,
      message: record.message,
      attachments: (record.attachments || []).map((a) => ({
        category: a.kind || 'attachment',
        url: a.url,
        fileName: a.fileName,
        originalFileName: a.originalFileName,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        storageKey: a.storageKey,
        storageProvider: a.storageProvider,
      })),
      status: record.status === 'draft' ? 'draft' : record.status || 'new',
      adminNotes: record.adminNotes,
      submittedAt: record.submittedAt,
      lastStatusUpdatedAt: record.lastStatusUpdatedAt,
      lastStatusUpdatedBy: record.lastStatusUpdatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      legacyAccommodationInquiryId: record._id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });

    migrated += 1;
  }

  console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped`);
  await mongoose.connection.close();
};

migrate().catch(async (error) => {
  console.error('Migration failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
