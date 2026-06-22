const express = require('express');
const authRoutes = require('./auth.customer.routes');
const inquiryRoutes = require('./inquiry.customer.routes');
const propertyOwnerRoutes = require('./property.owner.routes'); 


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/properties', propertyOwnerRoutes);

module.exports = router;
