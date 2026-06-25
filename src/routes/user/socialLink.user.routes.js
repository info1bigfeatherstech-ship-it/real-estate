const express = require('express');
const socialLinkController = require('../../controllers/user/socialLink.user.controller');

const router = express.Router();

/**
 * GET /api/v1/user/social-links
 * Get all active social links
 */
router.get('/', socialLinkController.getSocialLinks);

/**
 * GET /api/v1/user/properties/:id/share
 * Get share URLs for a property
 */
router.get('/properties/:id/share', socialLinkController.getPropertyShareUrls);

/**
 * GET /api/v1/user/agent/:id/linktree
 * Get agent linktree-style page
 */
router.get('/agent/:id/linktree', socialLinkController.getAgentLinktree);

module.exports = router;