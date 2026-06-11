const express = require('express');
const propertyRoutes = require('./property.user.routes');

const router = express.Router();

router.use('/properties', propertyRoutes);

module.exports = router;
