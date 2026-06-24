const express = require('express');
const propertyRoutes = require('./property.user.routes');
const eliteServiceRoutes = require('./eliteService.user.routes');
const fomoRoutes = require('./fomo.routes');
const accommodationInquiryRoutes = require('./accommodationInquiry.user.routes');
const propertyViewRoutes = require('./propertyView.user.routes');
const generalInquiryRoutes = require('./generalInquiry.user.routes'); 

const router = express.Router();

router.use('/properties', propertyRoutes);
router.use('/properties', propertyViewRoutes);
router.use('/fomo', fomoRoutes);            
router.use('/elite-services', eliteServiceRoutes);
router.use('/accommodation-inquiries', accommodationInquiryRoutes);
router.use('/general-inquiries', generalInquiryRoutes);



module.exports = router;
   