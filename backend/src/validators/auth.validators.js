import { z } from "zod";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/;

const mobileNumberRegex = /^[0-9]{10}$/;

const otpRegex = /^[0-9]{4,6}$/;

// REGISTER
const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email format")
      .optional(),

    mobileNumber: z
      .string()
      .trim()
      .regex(
        mobileNumberRegex,
        "Mobile number must be exactly 10 digits"
      )
      .optional(),

    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must contain at least 8 characters, one uppercase letter, one number and one special character"
      ),
  })
  .refine(
    (data) => data.email || data.mobileNumber,
    {
      message: "Email or mobile number is required",
      path: ["email"],
    }
  );

// LOGIN
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format"),

  password: z
    .string()
    .min(1, "Password is required"),
});

// CHANGE PASSWORD
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),

    newPassword: z
      .string()
      .regex(
        passwordRegex,
        "Password must contain at least 8 characters, one uppercase letter, one number and one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

// SEND LOGIN OTP
const sendLoginOtpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email format")
      .optional(),

    mobileNumber: z
      .string()
      .trim()
      .regex(
        mobileNumberRegex,
        "Mobile number must be exactly 10 digits"
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.email || data.mobileNumber,
    {
      message: "Please provide email or mobile number",
      path: ["email"],
    }
  );

// VERIFY OTP
const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(
      otpRegex,
      "OTP must be 4 to 6 digits"
    ),
});

// RESEND OTP
const resendOtpSchema = z.object({});

// FORGOT PASSWORD
const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email format")
      .optional(),

    mobileNumber: z
      .string()
      .trim()
      .regex(
        mobileNumberRegex,
        "Mobile number must be exactly 10 digits"
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.email || data.mobileNumber,
    {
      message: "Please provide email or mobile number",
      path: ["email"],
    }
  );

// VERIFY RESET OTP
const verifyResetOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(
      otpRegex,
      "OTP must be 4 to 6 digits"
    ),
});

// RESET PASSWORD
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .regex(
        passwordRegex,
        "Password must contain at least 8 characters, one uppercase letter, one number and one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  sendLoginOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
};