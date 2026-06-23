const express = require('express');
const fomoController = require('../../controllers/user/fomo.controller');

const router = express.Router();

/**
 * Get FOMO data for a property
 * GET /api/v1/user/fomo/property/:id
 */
router.get('/property/:id', fomoController.getPropertyFOMO);

/**
 * Get property with FOMO data
 * GET /api/v1/user/fomo/property/:id/detail
 */
router.get('/property/:id/detail', fomoController.getPropertyWithFOMO);

/**
 * Get area-wise demand
 * GET /api/v1/user/fomo/area/demand?city=Mumbai&area=Patel Nagar&limit=10
 */
router.get('/area/demand', fomoController.getAreaDemand);

/**
 * Get area FOMO (with message)
 * GET /api/v1/user/fomo/area/fomo?city=Mumbai&area=Patel Nagar
 */
router.get('/area/fomo', fomoController.getAreaDemandFOMO);

/**
 * Get trending properties
 * GET /api/v1/user/fomo/trending?limit=10&listingType=For Rent
 */
router.get('/trending', fomoController.getTrendingProperties);

module.exports = router;