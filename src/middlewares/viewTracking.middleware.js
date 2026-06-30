const PropertyView = require('../models/propertyView.model');

/**
 * Extract client IP from request
 */
const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    req.ip ||
    null
  );
};

/**
 * Extract session ID from request (or generate one)
 */
const getSessionId = (req) => {
  // Try to get from cookie or header
  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
  if (sessionId) return sessionId;

  // Generate new session ID if not exists
  const crypto = require('crypto');
  const newSessionId = crypto.randomBytes(16).toString('hex');
  
  // Set cookie for future requests
  if (req.res) {
    req.res.cookie('sessionId', newSessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      path: '/',
    });
  }
  
  return newSessionId;
};

/**
 * Track property view middleware
 * Attaches view tracking info to request
 */
const trackPropertyView = async (req, res, next) => {
  try {
    // Get property ID from params
    const propertyId = req.params.id || req.params.propertyId;
    if (!propertyId) {
      return next();
    }

    // Get viewer information
    const customer = req.customer || null;
    const ip = getClientIP(req);
    const sessionId = getSessionId(req);
    const userAgent = req.headers['user-agent'] || null;
    const referrer = req.headers['referer'] || req.headers['referrer'] || null;

    // Determine viewer type
    let viewerType = 'guest';
    let viewerName = null;
    let viewerMobile = null;
    let viewerEmail = null;

    if (customer) {
      viewerType = customer.accountType || 'seeker';
      viewerName = customer.fullName || null;
      viewerMobile = customer.mobile || null;
      viewerEmail = customer.email || null;
    }

    // Check if this is a unique view (same session + same property)
    const existingView = await PropertyView.findOne({
      propertyId,
      sessionId,
      isDeleted: false,
    }).sort({ viewedAt: -1 });

    // If view exists within last 30 minutes, don't count as new view
    const isUnique = !existingView || 
      (Date.now() - new Date(existingView.viewedAt).getTime() > 30 * 60 * 1000);

    // Create view record (async, don't wait)
    PropertyView.create({
      propertyId,
      viewerId: customer?._id || null,
      viewerType,
      viewerName,
      viewerMobile,
      viewerEmail,
      sessionId,
      ipAddress: ip,
      userAgent,
      referrer,
      source: req.query.source || 'direct',
      isUnique,
      viewedAt: new Date(),
    }).catch((err) => {
      console.error('Failed to track property view:', err);
    });

    // Attach view info to request for later use
    req.viewInfo = {
      propertyId,
      isUnique,
      sessionId,
      viewerType,
    };

    next();
  } catch (error) {
    // Don't fail the request if view tracking fails
    console.error('View tracking error:', error);
    next();
  }
};

module.exports = {
  trackPropertyView,
  getClientIP,
  getSessionId,
};