const authService = require('../../services/customer/auth.customer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');
const { buildAuthResponse } = require('../../utils/authResponse');
const {
  setCustomerRefreshTokenCookie,
  clearCustomerRefreshTokenCookie,
  getCustomerRefreshTokenFromRequest,
} = require('../../utils/customerAuthCookie');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, { message: result.message, data: result });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.verifyRegistrationOtp(req.body);
  setCustomerRefreshTokenCookie(res, refreshToken);
  return ApiResponse.success(res, {
    message: 'Email verified successfully',
    data: buildAuthResponse({ user, accessToken }),
  });
});

const resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendRegistrationOtp(req.body);
  return ApiResponse.success(res, { message: result.message, data: result });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setCustomerRefreshTokenCookie(res, refreshToken);
  return ApiResponse.success(res, {
    message: 'Login successful',
    data: buildAuthResponse({ user, accessToken }),
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = getCustomerRefreshTokenFromRequest(req);
  if (!token) {
    throw AppError.unauthorized('Refresh token is missing or expired');
  }

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(token);
  setCustomerRefreshTokenCookie(res, newRefreshToken);

  return ApiResponse.success(res, {
    message: 'Token refreshed successfully',
    data: buildAuthResponse({ accessToken }),
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.customer._id);
  clearCustomerRefreshTokenCookie(res);
  return ApiResponse.success(res, { message: 'Logged out successfully' });
});

const getMe = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.customer._id);
  const allowedForms = authService.getAllowedForms(profile.accountType);
  return ApiResponse.success(res, {
    message: 'Profile fetched successfully',
    data: { ...profile, allowedForms },
  });
});

module.exports = { register, verifyOtp, resendOtp, login, refreshToken, logout, getMe };
