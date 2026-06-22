const crypto = require('crypto');
const Customer = require('../../models/Customer.model');
const EmailOtp = require('../../models/EmailOtp.model');
const AppError = require('../../errors/AppError');
const env = require('../../config/env');
const { sendRegistrationOtpEmail, sendOtpEmail } = require('../email/otpEmail.service');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../../utils/token');

const TOKEN_TYPE = 'customer';
const OTP_PURPOSE = 'customer_signup';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const generateOtp = () => String(crypto.randomInt(100000, 999999));

const buildTokenPayload = (customer) => ({
  sub: customer._id.toString(),
  email: customer.email,
  accountType: customer.accountType,
  tokenType: TOKEN_TYPE,   
});

const normalizeMobile = (mobile) => {
  const digits = String(mobile || '').replace(/\s+/g, '');
  if (digits.startsWith('+91')) return digits;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  return digits;
};

const register = async ({ fullName, email, mobile, password, accountType }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedMobile = normalizeMobile(mobile);

  const existing = await Customer.findOne({
    $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }],
  });

  if (existing?.emailVerified) {
    throw AppError.conflict('An account with this email or mobile already exists');
  }

  if (existing && !existing.emailVerified) {
    await Customer.deleteOne({ _id: existing._id });
  }

  const pendingCustomer = await Customer.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    mobile: normalizedMobile,
    password,
    accountType,
    emailVerified: false,
    isActive: true,
  });

  await EmailOtp.deleteMany({ email: normalizedEmail, purpose: OTP_PURPOSE });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + env.otp.expiresMinutes * 60 * 1000);

  await EmailOtp.create({
    email: normalizedEmail,
    otpHash: hashOtp(otp),
    purpose: OTP_PURPOSE,
    expiresAt,
    metadata: { customerId: pendingCustomer._id.toString() },
  });
  let emailResult;
  try {
    emailResult = await sendRegistrationOtpEmail({ to: normalizedEmail, otp });
  } catch (error) {
    await EmailOtp.deleteMany({ email: normalizedEmail, purpose: OTP_PURPOSE });
    await Customer.deleteOne({ _id: pendingCustomer._id });
    throw AppError.badRequest('Failed to send OTP email. Please verify your email address and try again.');
  }

  return {
    email: normalizedEmail,
    message: 'OTP sent to your email. Please verify to complete registration.',
    ...(emailResult?.devOtp ? { devOtp: emailResult.devOtp } : {}),
  };
};

const verifyRegistrationOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const customer = await Customer.findOne({ email: normalizedEmail }).select('+password +refreshTokenHash');

  if (!customer) {
    throw AppError.notFound('Registration not found. Please sign up again.');
  }

  if (customer.emailVerified) {
    throw AppError.badRequest('Email is already verified. Please login.');
  }

  const otpRecord = await EmailOtp.findOne({
    email: normalizedEmail,
    purpose: OTP_PURPOSE,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).select('+otpHash');

  if (!otpRecord) {
    throw AppError.badRequest('OTP expired or not found. Please request a new OTP.');
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    throw AppError.tooManyRequests('Too many invalid OTP attempts. Please sign up again.');
  }

  if (hashOtp(otp) !== otpRecord.otpHash) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw AppError.badRequest('Invalid OTP');
  }

  otpRecord.consumedAt = new Date();
  await otpRecord.save();

  customer.emailVerified = true;
  customer.lastLoginAt = new Date();

  const accessToken = signAccessToken(buildTokenPayload(customer));
  const refreshToken = signRefreshToken({ sub: customer._id.toString(), tokenType: TOKEN_TYPE });

  customer.refreshTokenHash = hashToken(refreshToken);
  await customer.save({ validateBeforeSave: false });

  return {
    user: {
      id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      mobile: customer.mobile,
      accountType: customer.accountType,
      emailVerified: customer.emailVerified,
      lastLoginAt: customer.lastLoginAt,
    },
    accessToken,
    refreshToken,
  };
};

const resendRegistrationOtp = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const customer = await Customer.findOne({ email: normalizedEmail });

  if (!customer) {
    throw AppError.notFound('Registration not found');
  }

  if (customer.emailVerified) {
    throw AppError.badRequest('Email is already verified. Please login.');
  }

  await EmailOtp.deleteMany({ email: normalizedEmail, purpose: OTP_PURPOSE });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + env.otp.expiresMinutes * 60 * 1000);

  await EmailOtp.create({
    email: normalizedEmail,
    otpHash: hashOtp(otp),
    purpose: OTP_PURPOSE,
    expiresAt,
    metadata: { customerId: customer._id.toString() },
  });

  let emailResult;
  try {
    emailResult = await sendOtpEmail({ to: normalizedEmail, otp, purpose: OTP_PURPOSE });
  } catch (error) {
    throw AppError.badRequest('Failed to resend OTP email. Please try again shortly.');
  }

  return {
    email: normalizedEmail,
    message: 'OTP resent successfully',
    ...(emailResult?.devOtp ? { devOtp: emailResult.devOtp } : {}),
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const customer = await Customer.findOne({ email: normalizedEmail }).select('+password +refreshTokenHash');

  if (!customer || !customer.isActive) {
    throw AppError.unauthorized('Invalid email or password');
  }

  if (!customer.emailVerified) {
    throw AppError.forbidden('Please verify your email before logging in');
  }

  const isPasswordValid = await customer.comparePassword(password);
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const accessToken = signAccessToken(buildTokenPayload(customer));
  const refreshToken = signRefreshToken({ sub: customer._id.toString(), tokenType: TOKEN_TYPE });

  customer.refreshTokenHash = hashToken(refreshToken);
  customer.lastLoginAt = new Date();
  await customer.save({ validateBeforeSave: false });

  return {
    user: {
      id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      mobile: customer.mobile,
      accountType: customer.accountType,
      emailVerified: customer.emailVerified,
      lastLoginAt: customer.lastLoginAt,
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

  if (decoded.tokenType !== TOKEN_TYPE) {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const customer = await Customer.findById(decoded.sub).select('+refreshTokenHash');

  if (!customer || !customer.isActive || !customer.emailVerified || !customer.refreshTokenHash) {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const incomingHash = hashToken(refreshToken);
  if (incomingHash !== customer.refreshTokenHash) {
    throw AppError.unauthorized('Refresh token has been revoked');
  }

  const accessToken = signAccessToken(buildTokenPayload(customer));
  const newRefreshToken = signRefreshToken({ sub: customer._id.toString(), tokenType: TOKEN_TYPE });

  customer.refreshTokenHash = hashToken(newRefreshToken);
  await customer.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (customerId) => {
  await Customer.findByIdAndUpdate(customerId, { refreshTokenHash: null });
};

const getProfile = async (customerId) => {
  const customer = await Customer.findById(customerId);
  if (!customer || !customer.isActive) {
    throw AppError.notFound('Customer not found');
  }
  return {
    id: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    mobile: customer.mobile,
    accountType: customer.accountType,
    emailVerified: customer.emailVerified,
    lastLoginAt: customer.lastLoginAt,
    createdAt: customer.createdAt,
  };
};

//there no n


const getAllowedForms = (accountType) => {
  const { FORM_ACCESS_BY_ACCOUNT_TYPE } = require('../../constants/customerAccountTypes');
  return FORM_ACCESS_BY_ACCOUNT_TYPE[accountType] || [];
};

module.exports = {
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  refreshAccessToken,
  logout,
  getProfile,
  getAllowedForms,
  TOKEN_TYPE,
};



