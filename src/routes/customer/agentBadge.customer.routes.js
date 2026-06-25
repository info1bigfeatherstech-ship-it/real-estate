const express = require('express');
const agentBadgeController = require('../../controllers/customer/agentBadge.customer.controller');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');

const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// ─── Get My Badge ──────────────────────────────────────────────────────────
router.get('/my-badge', agentBadgeController.getMyBadge);

// ─── Get My Badge History ──────────────────────────────────────────────────
router.get('/my-badge/history', agentBadgeController.getMyBadgeHistory);

// ─── Get Leaderboard ──────────────────────────────────────────────────────
router.get('/leaderboard', agentBadgeController.getLeaderboard);

// ─── Increment Deal Count (Called when property status changes) ──────────
router.post('/deal/:propertyId', agentBadgeController.incrementDealCount);

module.exports = router;