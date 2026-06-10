const express = require('express');
const adminRoutes = require('./admin/index.admin.routes');
const userRoutes = require('./user/index.user.routes');
const healthRoutes = require('./health.routes');
const constants = require('../constants');

const router = express.Router();

router.get('/constants', (_req, res) => {
  res.json({ success: true, data: constants });
});

router.use('/health', healthRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);

module.exports = router;
