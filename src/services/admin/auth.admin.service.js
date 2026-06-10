const crypto = require('crypto');
const User = require('../../models/User.model');
const AppError = require('../../errors/AppError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/token');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const buildTokenPayload = (user) => ({
  sub: user._id.toString(),
  email: user.email,
  role: user.role,
});

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokenHash');

  if (!user || !user.isActive) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const accessToken = signAccessToken(buildTokenPayload(user));
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
    },
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');

  if (!user || !user.isActive || !user.refreshTokenHash) {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const incomingHash = hashToken(refreshToken);
  if (incomingHash !== user.refreshTokenHash) {
    throw AppError.unauthorized('Refresh token has been revoked');
  }

  const accessToken = signAccessToken(buildTokenPayload(user));
  const newRefreshToken = signRefreshToken({ sub: user._id.toString() });

  user.refreshTokenHash = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');
  return user;
};

module.exports = { login, refreshAccessToken, logout, getProfile };
