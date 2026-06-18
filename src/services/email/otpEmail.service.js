const env = require('../../config/env');
const logger = require('../../utils/logger');
const { sendMail, isEmailConfigured } = require('./emailTransport.service');

const OTP_TEMPLATES = Object.freeze({
  customer_signup: {
    subject: 'Verify your Mehta Estates account',
    purposeLabel: 'account registration',
  },
});

const buildOtpEmailContent = ({ otp, purposeLabel }) => {
  const text = [
    'Hello,',
    '',
    `Your one-time password (OTP) for ${purposeLabel} is: ${otp}`,
    '',
    `This OTP is valid for ${env.otp.expiresMinutes} minutes. Do not share it with anyone.`,
    '',
    '— Mehta Estates Team',
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#1e40af;margin:0 0 16px;">Mehta Estates</h2>
      <p style="color:#334155;">Your OTP for <strong>${purposeLabel}</strong> is:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e40af;margin:16px 0;">${otp}</p>
      <p style="color:#64748b;font-size:14px;">Valid for ${env.otp.expiresMinutes} minutes. Do not share this code.</p>
    </div>
  `;

  return { text, html };
};

/**
 * Sends a registration OTP email. Throws if delivery fails when email is configured.
 * In development without SMTP, logs OTP and returns { delivered: false, devOtp }.
 */
const sendRegistrationOtpEmail = async ({ to, otp }) => {
  const template = OTP_TEMPLATES.customer_signup;
  const { text, html } = buildOtpEmailContent({ otp, purposeLabel: template.purposeLabel });

  if (!isEmailConfigured()) {
    if (env.isDevelopment) {
      logger.warn({ to, otp }, 'SMTP not configured — OTP logged for development only');
      return { delivered: false, devOtp: otp };
    }
    throw new Error('Email service is not configured');
  }

  await sendMail({
    to,
    subject: template.subject,
    text,
    html,
  });

  return { delivered: true };
};

const sendOtpEmail = async ({ to, otp, purpose = 'customer_signup' }) => {
  if (purpose === 'customer_signup') {
    return sendRegistrationOtpEmail({ to, otp });
  }

  const template = OTP_TEMPLATES[purpose];
  if (!template) {
    throw new Error(`Unknown OTP email purpose: ${purpose}`);
  }

  const { text, html } = buildOtpEmailContent({ otp, purposeLabel: template.purposeLabel });

  if (!isEmailConfigured()) {
    if (env.isDevelopment) {
      logger.warn({ to, otp, purpose }, 'SMTP not configured — OTP logged for development only');
      return { delivered: false, devOtp: otp };
    }
    throw new Error('Email service is not configured');
  }

  await sendMail({ to, subject: template.subject, text, html });
  return { delivered: true };
};

module.exports = {
  sendRegistrationOtpEmail,
  sendOtpEmail,
  OTP_TEMPLATES,
};
