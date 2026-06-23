const express = require('express');
const authRoutes = require('./auth.customer.routes');
const inquiryRoutes = require('./inquiry.customer.routes');
const propertyOwnerRoutes = require('./property.owner.routes'); 
const propertyInventoryRoutes = require('./propertyInventory.customer.routes');
const tenantEntryRoutes = require('./tenantEntry.customer.routes');
const tenantExitRoutes = require('./tenantExit.customer.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/properties', propertyOwnerRoutes);
router.use('/inventory', propertyInventoryRoutes);
router.use('/tenants', tenantEntryRoutes);
router.use('/exits', tenantExitRoutes);

module.exports = router;
