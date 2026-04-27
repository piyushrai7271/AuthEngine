import express from "express";
import jwtAuth from "../middlewares/auth.middleware.js";
import { otpAuth, resetAuth } from "../middlewares/otp.middleware.js";

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
  getCurrentUser

} from "../controllers/auth.controller.js";

const router = express.Router();


// BASIC AUTH
router.post("/register", register);
router.post("/login", loginWithPassword);
router.post("/refresh-token", refreshAccessToken);

// PROTECTED (JWT)
router.post("/change-password", jwtAuth, changePassword);
router.post("/logout", jwtAuth, logOutUser);
router.post("/logout-all", jwtAuth, logOutAllDevices);

// OTP LOGIN FLOW
router.post("/login/otp/send", sendLoginOtp);
router.post("/login/otp/verify", otpAuth, verifyOtpAndLogin);
router.post("/login/otp/resend", otpAuth, resendOtp);

// FORGOT PASSWORD FLOW
router.post("/password/forgot", forgotPassword);
router.post("/password/verify-otp", otpAuth, verifyResetOtp);
router.post("/password/reset", resetAuth, resetPassword);

// get apis....
router.get("/me",jwtAuth,getCurrentUser);


export default router;