const express = require('express');
const authController = require('../../controllers/customer/auth.customer.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authRateLimiter } = require('../../middlewares/rateLimiter.middleware');
const { authenticateCustomer } = require('../../middlewares/customerAuth.middleware');
const {
  registerCustomerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginCustomerSchema,
} = require('../../validators/customer/auth.customer.validator');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerCustomerSchema), authController.register);
router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', authRateLimiter, validate(resendOtpSchema), authController.resendOtp);
router.post('/login', authRateLimiter, validate(loginCustomerSchema), authController.login);
router.post('/refresh-token', authRateLimiter, authController.refreshToken);
router.post('/logout', authenticateCustomer, authController.logout);
router.get('/me', authenticateCustomer, authController.getMe);

module.exports = router;
