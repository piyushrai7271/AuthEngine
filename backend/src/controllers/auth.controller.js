import User from "../models/auth.model.js";
import Session from "../models/session.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ms from "ms";
import {
  getAccessTokenOptions,
  getRefreshTokenOptions,
} from "../utils/cookieOptions.js";

const generateAccessAndRefreshToken = async (user, req) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  await Session.create({
    user: user._id,
    refreshToken,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY)),
  });

  return { accessToken, refreshToken };
};
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

  // check if password login allowed
  if (!user.password) {
    throw new ApiError(400, "Password login not available for this user");
  }

  // verify password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // generate tokens + session
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user,
    req,
  );

  // safe user
  const safeUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenOptions())
    .json(
      new ApiResponse(
        200,
        safeUser,
        "User logged in successfully"
    ));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  // verify JWT
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedToken?._id) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // find session
  const session = await Session.findOne({
    refreshToken: incomingRefreshToken,
    isValid: true,
  });

  if (!session) {
    throw new ApiError(401, "Session expired or invalid");
  }

  // check session expiry
  if (session.expiresAt < new Date()) {
    throw new ApiError(401, "Session expired");
  }

  // match user with token
  if (session.user.toString() !== decodedToken._id.toString()) {
    throw new ApiError(401, "Token mismatch");
  }

  // find user
  const user = await User.findById(session.user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // generate new tokens (rotation)
  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // update session
  session.refreshToken = newRefreshToken;
  await session.save();

  // response
  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .cookie("refreshToken", newRefreshToken, getRefreshTokenOptions())
    .json(
      new ApiResponse(
        200,
        {},
        "Access token refreshed successfully"
      )
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
    { isValid: false }
  );

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  return res
    .status(200)
    .clearCookie("accessToken", getAccessTokenOptions())
    .clearCookie("refreshToken", getRefreshTokenOptions())
    .json(
      new ApiResponse(200, {}, "Logged out from current device")
    );
});
const logOutAllDevices = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }

  // ✅ invalidate all sessions
  await Session.updateMany(
    { user: req.user._id },
    { isValid: false }
  );

  return res
    .status(200)
    .clearCookie("accessToken", getAccessTokenOptions())
    .clearCookie("refreshToken", getRefreshTokenOptions())
    .json(
      new ApiResponse(200, {}, "Logged out from all devices")
    );
});

export {
  register,
  loginWithPassword,
  refreshAccessToken,
  logOutUser,
  logOutAllDevices
}