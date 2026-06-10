const express = require('express');
const dashboardController = require('../../controllers/admin/dashboard.admin.controller');

const router = express.Router();

router.get('/stats', dashboardController.getStats);

module.exports = router;
