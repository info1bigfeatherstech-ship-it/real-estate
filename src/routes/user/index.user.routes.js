const express = require('express');
const propertyRoutes = require('./property.user.routes');
const eliteServiceRoutes = require('./eliteService.user.routes');

const router = express.Router();

router.use('/properties', propertyRoutes);
router.use('/elite-services', eliteServiceRoutes);

module.exports = router;
