import express from "express";
import jwtAuth from "../middlewares/auth.middleware.js";
import { otpAuth, resetAuth } from "../middlewares/otp.middleware.js";
import validate from "../middlewares/validate.middleware.js";
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

  // OTP auth
  sendLoginOtp,
  verifyOtpAndLogin,
  resendOtp,

  // Password reset
  forgotPassword,
  verifyResetOtp,
  resetPassword,

  // get api
  getCurrentUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

// BASIC AUTH
router.post("/register", validate(registerSchema, "body"), register);
router.post("/login", validate(loginSchema, "body"), loginWithPassword);
router.post("/refresh-token", refreshAccessToken);


// PROTECTED (JWT)
router.post(
  "/change-password",
  jwtAuth,
  validate(changePasswordSchema, "body"),
  changePassword,
);
router.post("/logout", jwtAuth, logOutUser);
router.post("/logout-all", jwtAuth, logOutAllDevices);

// OTP LOGIN FLOW
router.post(
  "/login/otp/send",
  validate(sendLoginOtpSchema, "body"),
  sendLoginOtp,
);
router.post(
  "/login/otp/verify",
  otpAuth,
  validate(verifyOtpSchema, "body"),
  verifyOtpAndLogin,
);
router.post(
  "/login/otp/resend",
  otpAuth,
  validate(resendOtpSchema, "body"),
  resendOtp,
);

// FORGOT PASSWORD FLOW
router.post(
  "/password/forgot",
  validate(forgotPasswordSchema, "body"),
  forgotPassword,
);
router.post(
  "/password/verify-otp",
  otpAuth,
  validate(verifyResetOtpSchema, "body"),
  verifyResetOtp,
);
router.post(
  "/password/reset",
  resetAuth,
  validate(resetPasswordSchema, "body"),
  resetPassword,
);

// GET CURRENT USER
router.get("/me", jwtAuth, getCurrentUser);

export default router;
