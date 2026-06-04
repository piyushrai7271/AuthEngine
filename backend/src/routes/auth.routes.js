import express from "express";
import jwtAuth from "../middlewares/auth.middleware.js";
import { otpAuth, resetAuth } from "../middlewares/otp.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  globalRateLimiter,
  registerRateLimiter,
  loginRateLimiter,
  otpSendRateLimiter,
  otpVerifyRateLimiter,
  resetPasswordRateLimiter,
  refreshTokenRateLimiter,
} from "../middlewares/rateLimit.middleware.js";

import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  sendLoginOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.validators.js";

import {
  register,
  loginWithPassword,
  refreshAccessToken,
  changePassword,
  logOutUser,
  logOutAllDevices,
  sendLoginOtp,
  verifyOtpAndLogin,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getCurrentUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

// BASIC AUTH
router.post(
  "/register",
  registerRateLimiter,
  validate(registerSchema, "body"),
  register,
);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema, "body"),
  loginWithPassword,
);

router.post("/refresh-token", refreshTokenRateLimiter, refreshAccessToken);

// PROTECTED
router.post(
  "/change-password",
  jwtAuth,
  resetPasswordRateLimiter,
  validate(changePasswordSchema, "body"),
  changePassword,
);

router.post("/logout", jwtAuth, logOutUser);

router.post("/logout-all", jwtAuth, logOutAllDevices);

// OTP LOGIN FLOW
router.post(
  "/login/otp/send",
  otpSendRateLimiter,
  validate(sendLoginOtpSchema, "body"),
  sendLoginOtp,
);

router.post(
  "/login/otp/verify",
  otpVerifyRateLimiter,
  otpAuth,
  validate(verifyOtpSchema, "body"),
  verifyOtpAndLogin,
);

router.post(
  "/login/otp/resend",
  otpSendRateLimiter,
  otpAuth,
  validate(resendOtpSchema, "body"),
  resendOtp,
);

// FORGOT PASSWORD FLOW
router.post(
  "/password/forgot",
  otpSendRateLimiter,
  validate(forgotPasswordSchema, "body"),
  forgotPassword,
);

router.post(
  "/password/verify-otp",
  otpVerifyRateLimiter,
  otpAuth,
  validate(verifyResetOtpSchema, "body"),
  verifyResetOtp,
);

router.post(
  "/password/reset",
  resetPasswordRateLimiter,
  resetAuth,
  validate(resetPasswordSchema, "body"),
  resetPassword,
);

// CURRENT USER
router.get("/me", jwtAuth, getCurrentUser);

export default router;
