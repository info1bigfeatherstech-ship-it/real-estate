const authService = require('../../services/admin/auth.admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../errors/AppError');
const { buildAuthResponse } = require('../../utils/authResponse');
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
} = require('../../utils/authCookie');

const User = require('../../models/User.model');

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  setRefreshTokenCookie(res, refreshToken);

  return ApiResponse.success(res, {
    message: 'Login successful',
    data: buildAuthResponse({ user, accessToken }),
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = getRefreshTokenFromRequest(req);

  if (!token) {
    throw AppError.unauthorized('Refresh token is missing or expired');
  }

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(token);

  setRefreshTokenCookie(res, newRefreshToken);

  return ApiResponse.success(res, {
    message: 'Token refreshed successfully',
    data: buildAuthResponse({ accessToken }),
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  clearRefreshTokenCookie(res);
  return ApiResponse.success(res, { message: 'Logged out successfully' });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  return ApiResponse.success(res, { message: 'Profile fetched successfully', data: user });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select('_id name email role');
  return ApiResponse.success(res, { message: 'Users listed successfully', data: users });
});

module.exports = { login, refreshToken, logout, getMe, listUsers };
