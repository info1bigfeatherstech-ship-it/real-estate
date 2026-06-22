const express = require('express');
const propertyController = require('../../controllers/customer/property.owner.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');
const {
  createOwnerPropertySchema,
  updateOwnerPropertySchema,
  updateOwnerPropertyStatusSchema,
  listOwnerPropertiesQuerySchema,
  ownerPropertyIdParamSchema,
} = require('../../validators/customer/property.owner.validator');
const { uploadImage, uploadDocument, handleMulterError } = require('../../middlewares/upload.middleware');

const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// ─── List & Create ──────────────────────────────────────────────────────
router.get(
  '/',
  validate(listOwnerPropertiesQuerySchema, 'query'),
  propertyController.listProperties
);

router.post(
  '/',
  validate(createOwnerPropertySchema),
  propertyController.createProperty
);

// ─── Get, Update, Delete ────────────────────────────────────────────────
router.get(
  '/:id',
  validate(ownerPropertyIdParamSchema, 'params'),
  propertyController.getProperty
);

router.put(
  '/:id',
  validate(ownerPropertyIdParamSchema, 'params'),
  validate(updateOwnerPropertySchema),
  propertyController.updateProperty
);

router.patch(
  '/:id/status',
  validate(ownerPropertyIdParamSchema, 'params'),
  validate(updateOwnerPropertyStatusSchema),
  propertyController.updatePropertyStatus
);

router.delete(
  '/:id',
  validate(ownerPropertyIdParamSchema, 'params'),
  propertyController.deleteProperty
);

// ─── ✅ OWNER/MEDIA ROUTES (NEW) ────────────────────────────────────────────
router.post(
  '/:id/media',
  validate(ownerPropertyIdParamSchema, 'params'),
  uploadImage.single('file'),
  handleMulterError,
  propertyController.uploadMedia
);

router.put(
  '/:id/media/:mediaId',
  validate(ownerPropertyIdParamSchema, 'params'),
  uploadImage.single('file'),
  handleMulterError,
  propertyController.replaceMedia
);

router.patch(
  '/:id/media/:mediaId',
  validate(ownerPropertyIdParamSchema, 'params'),
  propertyController.updateMediaMeta
);

router.delete(
  '/:id/media/:mediaId',
  validate(ownerPropertyIdParamSchema, 'params'),
  propertyController.deleteMedia
);

// ─── ✅ OWNER/DOCUMENT ROUTES (NEW) ──────────────────────────────────────────
router.post(
  '/:id/documents',
  validate(ownerPropertyIdParamSchema, 'params'),
  uploadDocument.single('file'),
  handleMulterError,
  propertyController.uploadDocument
);

router.put(
  '/:id/documents/:documentId',
  validate(ownerPropertyIdParamSchema, 'params'),
  uploadDocument.single('file'),
  handleMulterError,
  propertyController.replaceDocument
);

router.patch(
  '/:id/documents/:documentId',
  validate(ownerPropertyIdParamSchema, 'params'),
  propertyController.updateDocumentMeta
);

router.delete(
  '/:id/documents/:documentId',
  validate(ownerPropertyIdParamSchema, 'params'),
  propertyController.deleteDocument
);

module.exports = router;