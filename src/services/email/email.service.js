const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.email.enabled) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.email.smtpHost,
    port: env.email.smtpPort,
    secure: env.email.smtpSecure,
    auth: {
      user: env.email.smtpUser,
      pass: env.email.smtpPass,
    },
  });

  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: env.email.from,
    to,
    subject,
    text,
    html,
  };

  const transport = getTransporter();

  if (!transport) {
    logger.info({ to, subject, text }, 'Email skipped (SMTP not configured) — OTP logged for development');
    return { messageId: 'dev-mode', preview: text };
  }

  const info = await transport.sendMail(mailOptions);
  logger.info({ to, messageId: info.messageId }, 'Email sent');
  return info;
};

const sendOtpEmail = async ({ to, otp, purposeLabel = 'verification' }) => {
  const subject = `Your ${purposeLabel} OTP — Mehta Estates`;
  const text = [
    'Hello,',
    '',
    `Your one-time password (OTP) for ${purposeLabel} is: ${otp}`,
    '',
    'This OTP is valid for 10 minutes. Do not share it with anyone.',
    '',
    '— Mehta Estates Team',
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#1e40af;">Mehta Estates</h2>
      <p>Your OTP for <strong>${purposeLabel}</strong> is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#1e40af;">${otp}</p>
      <p style="color:#64748b;font-size:14px;">Valid for 10 minutes. Do not share this code.</p>
    </div>
  `;

  return sendMail({ to, subject, text, html });
};

module.exports = { sendMail, sendOtpEmail };
