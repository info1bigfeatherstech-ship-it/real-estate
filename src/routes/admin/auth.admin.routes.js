const express = require('express');
const authController = require('../../controllers/admin/auth.admin.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');
const { authRateLimiter } = require('../../middlewares/rateLimiter.middleware');
const { loginSchema } = require('../../validators/admin/auth.admin.validator');

const router = express.Router();

const methodNotAllowed = (message) => (_req, res) =>
  res.status(405).json({ success: false, errorCode: 'METHOD_NOT_ALLOWED', message });

router
  .route('/login')
  .post(authRateLimiter, validate(loginSchema), authController.login)
  .all(methodNotAllowed('Use POST /api/v1/admin/auth/login with email and password'));

router
  .route('/refresh-token')
  .post(authRateLimiter, authController.refreshToken)
  .all(methodNotAllowed('Use POST /api/v1/admin/auth/refresh-token'));

router.use(authenticate, requireAdmin);

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);

module.exports = router;
