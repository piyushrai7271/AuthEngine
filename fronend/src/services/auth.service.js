import api from "./api.js";

// BASIC AUTH
const registerUser = (data) => {
  return api.post("/api/auth/register", data);
};

const loginUser = (data) => {
  return api.post("/api/auth/login", data);
};

const refreshToken = () => {
  return api.post("/api/auth/refresh-token");
};

// LOGOUT / SESSION

const logoutUser = () => {
  return api.post("/api/auth/logout");
};

const logoutAllDevices = () => {
  return api.post("/api/auth/logout-all");
};

// PASSWORD CHANGE
const changePassword = (data) => {
  return api.post("/api/auth/change-password", data);
};

// OTP LOGIN FLOW
// Step 1: Send OTP
const sendLoginOtp = (data) => {
  return api.post("/api/auth/login/otp/send", data);
};

// Step 2: Verify OTP (requires otpToken)
const verifyLoginOtp = (data, otpToken) => {
  return api.post("/api/auth/login/otp/verify", data, {
    headers: {
      Authorization: `Bearer ${otpToken}`,
    },
  });
};

// Step 3: Resend OTP
const resendLoginOtp = (otpToken) => {
  return api.post(
    "/api/auth/login/otp/resend",
    {},
    {
      headers: {
        Authorization: `Bearer ${otpToken}`,
      },
    }
  );
};

// FORGOT PASSWORD FLOW
// Step 1: Send OTP
const forgotPassword = (data) => {
  return api.post("/api/auth/password/forgot", data);
};

// Step 2: Verify OTP (returns resetToken)
const verifyResetOtp = (data, otpToken) => {
  return api.post("/api/auth/password/verify-otp", data, {
    headers: {
      Authorization: `Bearer ${otpToken}`,
    },
  });
};

// Step 3: Reset Password
const resetPassword = (data, resetToken) => {
  return api.post("/api/auth/password/reset", data, {
    headers: {
      Authorization: `Bearer ${resetToken}`,
    },
  });
};

export{
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    logoutAllDevices,
    changePassword,
    sendLoginOtp,
    verifyLoginOtp,
    resendLoginOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword
}