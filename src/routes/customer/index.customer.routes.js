const express = require('express');
const authRoutes = require('./auth.customer.routes');
const inquiryRoutes = require('./inquiry.customer.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/inquiries', inquiryRoutes);

module.exports = router;
