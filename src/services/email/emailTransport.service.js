const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../utils/logger');

let transporter = null;
let verified = false;

const createTransporter = () => {
  if (!env.email.enabled) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.email.smtpHost,
    port: env.email.smtpPort,
    secure: env.email.smtpSecure,
    auth: {
      user: env.email.smtpUser,
      pass: env.email.smtpPass,
    },
  });
};

const getTransporter = async () => {
  if (transporter) return transporter;

  transporter = createTransporter();
  if (!transporter) return null;

  if (!verified) {
    try {
      await transporter.verify();
      verified = true;
      logger.info('Email transport verified successfully');
    } catch (error) {
      logger.warn({ err: error.message }, 'Email transport verify failed — will attempt send anyway');
    }
  }

  return transporter;
};

const isEmailConfigured = () => env.email.enabled;

const sendMail = async ({ to, subject, text, html }) => {
  const transport = await getTransporter();

  if (!transport) {
    throw new Error('Email transport is not configured');
  }

  const info = await transport.sendMail({
    from: env.email.from,
    to,
    subject,
    text,
    html,
  });

  logger.info({ to, messageId: info.messageId }, 'Email sent');
  return info;
};

module.exports = {
  getTransporter,
  sendMail,
  isEmailConfigured,
};
