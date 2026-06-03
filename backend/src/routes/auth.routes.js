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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Core Authentication
 *     summary: Register a new user
 *     description: Creates a new account using email or mobile number and password. Provide either email or mobileNumber.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Piyush Rai
 *               email:
 *                 type: string
 *                 example: piyush@gmail.com
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 686d8d8c8f9a123456789abc
 *                     fullName:
 *                       type: string
 *                       example: Piyush Rai
 *                     email:
 *                       type: string
 *                       example: piyush@gmail.com
 *                     mobileNumber:
 *                       type: string
 *                       example: "7737666496"
 *                     role:
 *                       type: string
 *                       enum:
 *                         - user
 *                         - admin
 *                       example: user
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *                     isBlocked:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-06-10T12:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-06-10T12:30:00.000Z
 *
 *       400:
 *         description: Validation error
 *
 *       409:
 *         description: User already exists with email or mobile
 */
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
