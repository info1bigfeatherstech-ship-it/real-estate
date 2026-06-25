const express = require('express');
const socialLinkController = require('../../controllers/admin/socialLink.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');
const {
  createSocialLinkSchema,
  updateSocialLinkSchema,
  toggleSocialLinkStatusSchema,
  socialLinkIdParamSchema,
} = require('../../validators/admin/socialLink.admin.validator');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// ─── List & Create ──────────────────────────────────────────────────────
router.get('/', socialLinkController.listSocialLinks);
router.post('/', validate(createSocialLinkSchema), socialLinkController.createSocialLink);

// ─── Get, Update, Delete ────────────────────────────────────────────────
router.get('/:id', validate(socialLinkIdParamSchema, 'params'), socialLinkController.getSocialLink);
router.put('/:id', validate(socialLinkIdParamSchema, 'params'), validate(updateSocialLinkSchema), socialLinkController.updateSocialLink);
router.patch('/:id/status', validate(socialLinkIdParamSchema, 'params'), validate(toggleSocialLinkStatusSchema), socialLinkController.toggleSocialLinkStatus);
router.delete('/:id', validate(socialLinkIdParamSchema, 'params'), socialLinkController.deleteSocialLink);

module.exports = router;