import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String, // email or phone
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      select: false,
    },

    purpose: {
      type: String,
      enum: ["login", "verify_email", "reset_password"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OTP", otpSchema);