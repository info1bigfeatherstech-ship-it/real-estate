const env = require('../config/env');

const REFRESH_COOKIE_NAME = env.cookie.refreshTokenName;

const parseDurationToMs = (value) => {
  const match = /^(\d+)([smhd])$/i.exec(String(value || '').trim());
  if (!match) return 10 * 24 * 60 * 60 * 1000;

  const amount = Number.parseInt(match[1], 10);
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2].toLowerCase()];
  return amount * unitMs;
};

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  path: env.cookie.path,
  maxAge: parseDurationToMs(env.jwt.refreshExpiresIn),
  ...(env.cookie.domain ? { domain: env.cookie.domain } : {}),
});

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    path: env.cookie.path,
    ...(env.cookie.domain ? { domain: env.cookie.domain } : {}),
  });
};

const getRefreshTokenFromRequest = (req) => req.cookies?.[REFRESH_COOKIE_NAME] || null;

module.exports = {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
};
