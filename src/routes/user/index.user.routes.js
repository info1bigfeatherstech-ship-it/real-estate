const express = require('express');
const propertyRoutes = require('./property.user.routes');
const eliteServiceRoutes = require('./eliteService.user.routes');
const accommodationInquiryRoutes = require('./accommodationInquiry.user.routes');

const router = express.Router();

router.use('/properties', propertyRoutes);
router.use('/elite-services', eliteServiceRoutes);
router.use('/accommodation-inquiries', accommodationInquiryRoutes);

module.exports = router;
