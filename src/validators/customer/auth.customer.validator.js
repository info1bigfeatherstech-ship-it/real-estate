const Joi = require('joi');
const { CUSTOMER_ACCOUNT_TYPES } = require('../../constants/customerAccountTypes');

const registerCustomerSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(120).required(),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  mobile: Joi.string().trim().min(10).max(20).required(),
  password: Joi.string().min(8).max(128).required(),
  accountType: Joi.string()
    .valid(...CUSTOMER_ACCOUNT_TYPES)
    .required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  otp: Joi.string().trim().length(6).pattern(/^\d{6}$/).required(),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
});

const loginCustomerSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
});

module.exports = {
  registerCustomerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginCustomerSchema,
};
