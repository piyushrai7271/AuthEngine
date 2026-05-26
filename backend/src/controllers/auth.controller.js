import User from "../models/auth.model.js";
import OTP from "../models/otp.model.js";
import Session from "../models/session.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendOtp, verifyOtp } from "../services/otp.service.js";
import { sendSecurityAlert } from "../services/email.service.js";
import { generateAccessAndRefreshToken } from "../services/token.service.js";
import {
  getAccessTokenOptions,
  getRefreshTokenOptions,
} from "../utils/cookieOptions.js";

const register = asyncHandler(async (req, res) => {
  const { fullName, email, mobileNumber, password } = req.body;

  // check existing user
  const existUser = await User.findOne({
    $or: [{ email: email || null }, { mobileNumber: mobileNumber || null }],
  });

  if (existUser) {
    throw new ApiError(409, "User already exists with email or mobile");
  }

  // create user
  const user = await User.create({
    fullName,
    email,
    mobileNumber,
    password,
    providers: [{ provider: "local" }],
  });

  // remove sensitive fields
  const createdUser = await User.findById(user._id).select("-password");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});
const loginWithPassword = asyncHandler(async (req, res) => {
  // input from body
  const { email, password } = req.body;

  // find user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(404, "Invalid email or password");
  }

  if (user.isBlocked) {
    throw new ApiError(
      403,
      "Your account is blocked, please connect with admin",
    );
  }

  // check account lock
  if (user.isAccountLocked()) {
    throw new ApiError(
      423,
      "Account temporarily locked due to multiple failed login attempts. Please try again later.",
    );
  }

  // check if password login allowed
  if (!user.password) {
    throw new ApiError(400, "Password login not available for this user");
  }

  // verify password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    await user.incrementLoginAttempts();

    throw new ApiError(401, "Invalid email or password");
  }

  // reset failed attempts
  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    await user.resetLoginAttempts();
  }

  // ADMIN → require OTP
  if (user.role === "admin") {
    // invalidate old OTPs
    await OTP.updateMany(
      {
        identifier: user.email,
        purpose: "admin_2fa",
        isUsed: false,
      },
      {
        isUsed: true,
      },
    );

    // send OTP
    await sendOtp({
      identifier: user.email,
      purpose: "admin_2fa",
    });

    // generate otp token
    const otpToken = user.generateOtpToken(user.email, "admin_2fa");

    return res
      .status(200)
      .json(new ApiResponse(200, { otpToken }, "OTP required for admin login"));
  }

  // NORMAL USER → direct login
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user,
    req,
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenOptions())
    .json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          role: user.role,
        },
        "User logged in successfully",
      ),
    );
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  // 🔐 get refresh token safely
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  // ❌ no refresh token
  if (!incomingRefreshToken) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  let decodedToken;

  // 🔍 verify refresh token
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // ❌ invalid payload
  if (!decodedToken?._id) {
    throw new ApiError(401, "Invalid refresh token payload");
  }

  // 🔍 find active session
  const session = await Session.findOne({
    user: decodedToken._id,
    isValid: true,
  })
    .sort({ createdAt: -1 })
    .select("+refreshToken");

  // ❌ session not found
  if (!session) {
    throw new ApiError(401, "Session invalid");
  }

  // ❌ token mismatch
  if (session.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  // ❌ session expired
  if (session.expiresAt < new Date()) {
    throw new ApiError(401, "Session expired");
  }

  // 🔍 find user
  const user = await User.findById(session.user);

  // ❌ user deleted
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 🔁 generate ONLY new access token
  const accessToken = user.generateAccessToken();

  // ✅ send updated access token
  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .cookie("refreshToken", incomingRefreshToken, getRefreshTokenOptions())
    .json(new ApiResponse(200, {}, "Access token refreshed"));
});
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const userId = req.user._id;

  // prevent same password
  if (currentPassword === newPassword) {
    throw new ApiError(
      400,
      "New password must be different from current password",
    );
  }

  // fetch user WITH password
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // verify current password
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // update password (hashed via pre hook)
  user.password = newPassword;

  await user.save();

  // invalidate all sessions (force logout everywhere)
  await Session.updateMany({ user: user._id }, { isValid: false });

  // clear cookies for current device
  return res
    .status(200)
    .clearCookie("accessToken", getAccessTokenOptions())
    .clearCookie("refreshToken", getRefreshTokenOptions())
    .json(
      new ApiResponse(
        200,
        {},
        "Password changed successfully. Please login again.",
      ),
    );
});
const logOutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(400, "No refresh token provided");
  }

  // ✅ invalidate session
  const session = await Session.findOneAndUpdate(
    { refreshToken },
    { isValid: false },
  );

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  return res
    .status(200)
    .clearCookie("accessToken", getAccessTokenOptions())
    .clearCookie("refreshToken", getRefreshTokenOptions())
    .json(new ApiResponse(200, {}, "Logged out from current device"));
});
const logOutAllDevices = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }

  // ✅ invalidate all sessions
  await Session.updateMany({ user: req.user._id }, { isValid: false });

  return res
    .status(200)
    .clearCookie("accessToken", getAccessTokenOptions())
    .clearCookie("refreshToken", getRefreshTokenOptions())
    .json(new ApiResponse(200, {}, "Logged out from all devices"));
});

// otp based controllers
const sendLoginOtp = asyncHandler(async (req, res) => {
  const { email, mobileNumber } = req.body;

  const identifier = mobileNumber ?? email;

  // build query safely
  const query = [];

  if (email) {
    query.push({ email });
  }

  if (mobileNumber) {
    query.push({ mobileNumber });
  }

  // find user
  const user = await User.findOne({
    $or: query,
  });

  // if user exists → process
  if (user) {
    // block check
    if (user.isBlocked) {
      throw new ApiError(403, "Account is blocked");
    }

    // admins cannot use direct OTP login
    if (user.role === "admin") {
      throw new ApiError(403, "Admins must login using email/password + OTP");
    }

    // invalidate old OTPs
    await OTP.updateMany(
      {
        identifier,
        purpose: "login",
        isUsed: false,
      },
      {
        isUsed: true,
      },
    );

    // send OTP
    await sendOtp({
      identifier,
      purpose: "login",
    });

    // generate otpToken
    const otpToken = user.generateOtpToken(identifier, "login");

    return res
      .status(200)
      .json(new ApiResponse(200, { otpToken }, "OTP sent if account exists"));
  }

  // user not found
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent if account exists"));
});
const verifyOtpAndLogin = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const { _id, identifier, purpose } = req.otpData;

  // only allowed purposes
  if (!["login", "admin_2fa"].includes(purpose)) {
    throw new ApiError(400, "Invalid OTP purpose");
  }

  // verify OTP
  await verifyOtp({
    identifier,
    otp,
    purpose,
  });

  // find user
  const user = await User.findById(_id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Account is blocked");
  }

  // BLOCK admin OTP-only login
  if (user.role === "admin" && purpose === "login") {
    throw new ApiError(
      403,
      "Admins must login using email/password or OAuth + OTP",
    );
  }

  // NORMAL USER LOGIN
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user,
    req,
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenOptions())
    .json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          role: user.role,
        },
        "Login successful",
      ),
    );
});
const resendOtp = asyncHandler(async (req, res) => {
  const { _id, identifier, purpose } = req.otpData;

  // allow both flows
  if (!["login", "admin_2fa"].includes(purpose)) {
    throw new ApiError(400, "Invalid OTP purpose");
  }

  const user = await User.findById(_id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Account is blocked");
  }

  // invalidate old OTPs
  await OTP.updateMany(
    {
      identifier,
      purpose,
      isUsed: false,
    },
    {
      isUsed: true,
    },
  );

  // send new OTP
  await sendOtp({
    identifier,
    purpose,
  });

  // generate new otp token
  const newOtpToken = user.generateOtpToken(identifier, purpose);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        otpToken: newOtpToken,
      },
      "OTP resent successfully",
    ),
  );
});

// forgot password flow
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, mobileNumber } = req.body;

  const identifier = mobileNumber ?? email;

  const query = [];

  if (email) {
    query.push({ email });
  }

  if (mobileNumber) {
    query.push({ mobileNumber });
  }

  // Find user (but DON'T expose result)
  const user = await User.findOne({
    $or: query,
  });

  // Always send same response (prevent user enumeration)
  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "If account exists, OTP sent successfully"),
      );
  }

  // block admin reset
  if (user.role === "admin") {
    throw new ApiError(403, "Admins must contact support to reset password");
  }

  // send OTP
  await sendOtp({
    identifier,
    purpose: "reset_password",
  });

  // generate otpToken
  const otpToken = user.generateOtpToken(identifier, "reset_password");

  // send response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { otpToken },
        "If account exists, OTP sent successfully",
      ),
    );
});
const verifyResetOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const { _id, identifier, purpose } = req.otpData;

  if (purpose !== "reset_password") {
    throw new ApiError(400, "Invalid OTP purpose");
  }

  // verify OTP
  await verifyOtp({
    identifier,
    otp,
    purpose: "reset_password",
  });

  // find user
  const user = await User.findById(_id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Account is blocked");
  }

  // generate reset token
  const resetToken = user.generateResetToken();

  return res
    .status(200)
    .json(new ApiResponse(200, { resetToken }, "OTP verified successfully"));
});
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  const { _id } = req.resetData;

  // get user
  const user = await User.findById(_id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // prevent password reuse
  const isSamePassword = await user.isPasswordCorrect(newPassword);

  if (isSamePassword) {
    throw new ApiError(400, "New password cannot be same as old password");
  }

  // update password
  user.password = newPassword;

  await user.save();

  // invalidate all sessions
  await Session.updateMany({ user: user._id }, { isValid: false });

  // send alert if admin
  if (user.role === "admin" && user.email) {
    await sendSecurityAlert(user.email);
  }

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("resetToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

// get api..
const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is already set by jwtAuth middleware
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
      "User fetched successfully !!",
    ),
  );
});

export {
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
};
