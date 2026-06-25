const express = require('express');
const badgeConfigController = require('../../controllers/admin/badgeConfig.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');
const {
  updateBadgeConfigSchema,
  addTierSchema,
  updateTierSchema,
  toggleTierStatusSchema,
  levelParamSchema,
} = require('../../validators/admin/badgeConfig.admin.validator');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// ─── Get Config ────────────────────────────────────────────────────────────
router.get('/config', badgeConfigController.getConfig);

// ─── Update Full Config ──────────────────────────────────────────────────
router.put('/config', validate(updateBadgeConfigSchema), badgeConfigController.updateConfig);

// ─── Tier Management ────────────────────────────────────────────────────
router.post('/tiers', validate(addTierSchema), badgeConfigController.addTier);

router.put(
  '/tiers/:level',
  validate(levelParamSchema, 'params'),
  validate(updateTierSchema),
  badgeConfigController.updateTier
);

router.patch(
  '/tiers/:level/status',
  validate(levelParamSchema, 'params'),
  validate(toggleTierStatusSchema),
  badgeConfigController.toggleTierStatus
);

router.delete(
  '/tiers/:level',
  validate(levelParamSchema, 'params'),
  badgeConfigController.deleteTier
);

module.exports = router;