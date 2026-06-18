/**
 * Maps unified Inquiry documents to legacy accommodation inquiry shape
 * for backward-compatible admin UI responses.
 */
const toLegacyAccommodationInquiry = (inquiry) => {
  if (!inquiry) return null;

  const doc = inquiry.toObject ? inquiry.toObject() : inquiry;
  const payload = doc.payload || {};

  return {
    ...doc,
    fullName: doc.contact?.fullName,
    mobile: doc.contact?.mobile,
    email: doc.contact?.email,
    alternativeMobile: doc.contact?.alternativeMobile,
    requirementType: payload.requirementType,
    occupantType: payload.occupantType,
    genderPreference: payload.genderPreference,
    monthlyBudget: payload.monthlyBudget,
    propertyType: payload.propertyType,
    bhkRequirement: payload.bhkRequirement,
    tenantTypePreference: payload.tenantTypePreference,
    foodPreference: payload.foodPreference,
    petPreference: payload.petPreference,
    smokingPreference: payload.smokingPreference,
    alcoholPreference: payload.alcoholPreference,
    sharingPreference: payload.sharingPreference,
    furnishingPreference: payload.furnishingPreference,
    amenitiesRequired: payload.amenitiesRequired || [],
    moveInPriority: payload.moveInPriority,
    attachments: (doc.attachments || []).map((a) => ({
      ...a,
      kind: a.category || a.kind,
    })),
  };
};

const mapLegacyList = (inquiries) => inquiries.map(toLegacyAccommodationInquiry);

module.exports = { toLegacyAccommodationInquiry, mapLegacyList };
