const express = require('express');
const propertyController = require('../../controllers/admin/property.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');
const {
  createPropertySchema,
  updatePropertySchema,
  updateStatusSchema,
  listPropertiesQuerySchema,
  uploadMediaSchema,
  updateMediaMetaSchema,
  uploadDocumentSchema,
  updateDocumentMetaSchema,
} = require('../../validators/admin/property.admin.validator');
const { uploadImage, uploadDocument, handleMulterError } = require('../../middlewares/upload.middleware');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// ─── Property CRUD ──────────────────────────────────────────────────────────
router.get('/', validate(listPropertiesQuerySchema, 'query'), propertyController.listProperties);
router.post('/', validate(createPropertySchema), propertyController.createProperty);
router.get('/:id', propertyController.getProperty);
router.put('/:id', validate(updatePropertySchema), propertyController.updateProperty);
router.patch('/:id/status', validate(updateStatusSchema), propertyController.updatePropertyStatus);
router.delete('/:id', propertyController.deleteProperty);

// ─── ✅ ADMIN APPROVAL ROUTES (NEW) ──────────────────────────────────────────
router.patch('/:id/approve', propertyController.approveProperty);   // ← ADD THIS
router.patch('/:id/reject', propertyController.rejectProperty);     // ← ADD THIS

// ─── Media Routes ──────────────────────────────────────────────────────────
router.post(
  '/:id/media',
  uploadImage.single('file'),
  handleMulterError,
  validate(uploadMediaSchema),
  propertyController.uploadMedia
);

router.put(
  '/:id/media/:mediaId',
  uploadImage.single('file'),
  handleMulterError,
  validate(uploadMediaSchema),
  propertyController.replaceMedia
);

router.patch(
  '/:id/media/:mediaId',
  validate(updateMediaMetaSchema),
  propertyController.updateMediaMeta
);

router.delete('/:id/media/:mediaId', propertyController.deleteMedia);

// ─── Document Routes ──────────────────────────────────────────────────────
router.post(
  '/:id/documents',
  uploadDocument.single('file'),
  handleMulterError,
  validate(uploadDocumentSchema),
  propertyController.uploadDocument
);

router.put(
  '/:id/documents/:documentId',
  uploadDocument.single('file'),
  handleMulterError,
  validate(uploadDocumentSchema),
  propertyController.replaceDocument
);

router.patch(
  '/:id/documents/:documentId',
  validate(updateDocumentMetaSchema),
  propertyController.updateDocumentMeta
);

// ─── ✅ ADMIN APPROVAL ROUTES (NEW) ──────────────────────────────────────────
router.patch('/:id/approve', propertyController.approveProperty);   // ✅
router.patch('/:id/reject', propertyController.rejectProperty);     // ✅

router.delete('/:id/documents/:documentId', propertyController.deleteDocument);

module.exports = router;