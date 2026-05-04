import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

// middleware fot otp based login
const otpAuth = (req, res, next) => {
  try {
    const token =
      req.cookies?.otpToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "OTP token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.OTP_TOKEN_SECRET);

    if (!decoded._id || !decoded.identifier || !decoded.purpose) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP token payload",
      });
    }

    req.otpData = decoded; // attach data

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired OTP token",
    });
  }
};

// middleware for reset password
const resetAuth = (req, res, next) => {
  try {
    const token =
      req.cookies?.resetToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Reset token missing");
    }

    const decoded = jwt.verify(
      token,
      process.env.RESET_TOKEN_SECRET
    );

    // validate payload
    if (!decoded._id || decoded.purpose !== "password_reset") {
      throw new ApiError(401, "Invalid reset token");
    }

    req.resetData = decoded; //  attach

    next();
  } catch (error) {
    next(error);
  }
};

export{
  otpAuth,
  resetAuth
}

;
