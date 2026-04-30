import User from "../models/auth.model.js";
import OTP from "../models/otp.model.js";
import Session from "../models/session.model.js";
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

  // validation
  if (!fullName || !password || (!email && !mobileNumber)) {
    throw new ApiError(
      400,
      "Provide fullName, password and email or mobileNumber",
    );
  }

  // normalize email
  const normalizedEmail = email?.toLowerCase();

  // check existing user (email OR mobile)
  const existUser = await User.findOne({
    $or: [
      { email: normalizedEmail || null },
      { mobileNumber: mobileNumber || null },
    ],
  });

  if (existUser) {
    throw new ApiError(409, "User already exists with email or mobile");
  }

  // create user
  const user = await User.create({
    fullName,
    email: normalizedEmail,
    mobileNumber,
    password,
    providers: [{ provider: "local" }],
  });

  // remove sensitive fields (your approach)
  const createdUser = await User.findById(user._id).select("-password");

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});
const loginWithPassword = asyncHandler(async (req, res) => {
  // input from body
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  // normalize email
  const normalizedEmail = email.toLowerCase();

  // find user
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    throw new ApiError(404, "User not found, please register first");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Account is blocked");
  }

  // check if password login allowed
  if (!user.password) {
    throw new ApiError(400, "Password login not available for this user");
  }

  // verify password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // 🔐 ADMIN → require OTP (2FA)
  if (user.role === "admin") {
    // invalidate old OTPs
    await OTP.updateMany(
      { identifier: user.email, purpose: "login", isUsed: false },
      { isUsed: true },
    );

    // send OTP
    await sendOtp({
      identifier: user.email,
      purpose: "login",
    });

    // generate otpToken
    const otpToken = user.generateOtpToken(user.email, "login");

    return res
      .status(200)
      .json(new ApiResponse(200, { otpToken }, "OTP required for admin login"));
  }

  // ✅ NORMAL USER → direct login
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
  // ✅ SAFE ACCESS (no crash)
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (!decodedToken?._id) {
    throw new ApiError(401, "Invalid refresh token payload");
  }

  const session = await Session.findOne({
    refreshToken: incomingRefreshToken,
    isValid: true,
  });

  if (!session) {
    throw new ApiError(401, "Session invalid");
  }

  if (session.expiresAt < new Date()) {
    throw new ApiError(401, "Session expired");
  }

  if (session.user.toString() !== decodedToken._id.toString()) {
    throw new ApiError(401, "Token mismatch");
  }

  const user = await User.findById(session.user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 🔁 rotate tokens
  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  session.refreshToken = newRefreshToken;
  await session.save();

  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .cookie("refreshToken", newRefreshToken, getRefreshTokenOptions())
    .json(new ApiResponse(200, {}, "Access token refreshed"));
});
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const userId = req.user._id;

  // validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "Please provide all required fields");
  }

  // check new vs confirm
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

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

  // 1. validate input
  if (!email && !mobileNumber) {
    throw new ApiError(400, "Please provide email or mobile number");
  }

  const identifier = mobileNumber ?? email;

  // 2. find user
  const user = await User.findOne({
    $or: [{ email }, { mobileNumber }],
  });

  // 3. if user exists → process
  if (user) {
    // block check (allowed to expose)
    if (user.isBlocked) {
      throw new ApiError(403, "Account is blocked");
    }

    // invalidate old OTPs
    await OTP.updateMany(
      { identifier, purpose: "login", isUsed: false },
      { isUsed: true },
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

  // 4. user not found → SAME RESPONSE (security)
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent if account exists"));
});
const verifyOtpAndLogin = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const { _id, identifier, purpose } = req.otpData;

  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }

  if (purpose !== "login") {
    throw new ApiError(400, "Invalid OTP purpose");
  }

  // ✅ verify OTP first
  await verifyOtp({
    identifier,
    otp,
    purpose: "login",
  });

  const user = await User.findById(_id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Account is blocked");
  }

  // 🔐 🚨 IMPORTANT: BLOCK ADMIN OTP LOGIN
  if (user.role === "admin") {
    throw new ApiError(
      403,
      "Admins must login using email/password + OTP (2FA required)",
    );
  }

  // ✅ Normal user → allow login
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

  if (!_id || !identifier) {
    throw new ApiError(400, "Invalid OTP session");
  }

  if (purpose !== "login") {
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
    { identifier, purpose: "login", isUsed: false },
    { isUsed: true },
  );

  await sendOtp({
    identifier,
    purpose: "login",
  });

  const newOtpToken = user.generateOtpToken(identifier, "login");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { otpToken: newOtpToken },
        "OTP resent successfully",
      ),
    );
});

// forgot password flow
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, mobileNumber } = req.body;

  // 1. Validate input
  if (!email && !mobileNumber) {
    throw new ApiError(400, "Please provide email or mobile number");
  }

  const identifier = mobileNumber || email;

  //2. Find user (but DON'T expose result)
  const user = await User.findOne({
    $or: [{ email }, { mobileNumber }],
  });

  // ❗ Always send same response (prevent user enumeration)
  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "If account exists, OTP sent successfully"),
      );
  }

  // block if admin is resetting password ❗ (LATER WE WILL HANDLE MORE ADVANCE WAY)
  if (user.role === "admin") {
    throw new ApiError(403, "Admins must contact support to reset password");
  }

  // 3. Send OTP (purpose: reset_password)
  await sendOtp({
    identifier,
    purpose: "reset_password",
  });

  // 4. Generate otpToken (short-lived)
  const otpToken = user.generateOtpToken(identifier, "reset_password");

  // 5. Send response (no user data)
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

  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }

  if (!_id || !identifier) {
    throw new ApiError(400, "Invalid OTP session");
  }

  if (purpose !== "reset_password") {
    throw new ApiError(400, "Invalid OTP purpose");
  }

  // ✅ verify OTP
  await verifyOtp({
    identifier,
    otp,
    purpose: "reset_password",
  });

  const user = await User.findById(_id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Account is blocked");
  }

  // ✅ use model method (GOOD you added this)
  const resetToken = user.generateResetToken();

  return res
    .status(200)
    .json(new ApiResponse(200, { resetToken }, "OTP verified successfully"));
});
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { _id } = req.resetData;

  if (!newPassword || !confirmPassword) {
    throw new ApiError(400, "Please provide all fields");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  // get user
  const user = await User.findById(_id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // prevent reuse
  const isSamePassword = await user.isPasswordCorrect(newPassword);
  if (isSamePassword) {
    throw new ApiError(400, "New password cannot be same as old password");
  }

  // update password
  user.password = newPassword;
  await user.save();

  // 🔥 invalidate all sessions
  await Session.updateMany({ user: user._id }, { isValid: false });

  // ✅ NEW: send alert if admin
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
