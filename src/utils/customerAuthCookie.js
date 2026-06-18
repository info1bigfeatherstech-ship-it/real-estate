const env = require('../config/env');

const REFRESH_COOKIE_NAME = env.customerCookie.refreshTokenName;

const parseDurationToMs = (value) => {
  const match = /^(\d+)([smhd])$/i.exec(String(value || '').trim());
  if (!match) return 10 * 24 * 60 * 60 * 1000;

  const amount = Number.parseInt(match[1], 10);
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2].toLowerCase()];
  return amount * unitMs;
};

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.customerCookie.secure,
  sameSite: env.customerCookie.sameSite,
  path: env.customerCookie.path,
  maxAge: parseDurationToMs(env.jwt.refreshExpiresIn),
  ...(env.customerCookie.domain ? { domain: env.customerCookie.domain } : {}),
});

const setCustomerRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

const clearCustomerRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.customerCookie.secure,
    sameSite: env.customerCookie.sameSite,
    path: env.customerCookie.path,
    ...(env.customerCookie.domain ? { domain: env.customerCookie.domain } : {}),
  });
};

const getCustomerRefreshTokenFromRequest = (req) => req.cookies?.[REFRESH_COOKIE_NAME] || null;

module.exports = {
  setCustomerRefreshTokenCookie,
  clearCustomerRefreshTokenCookie,
  getCustomerRefreshTokenFromRequest,
};
