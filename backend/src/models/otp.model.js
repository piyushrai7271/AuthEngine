import mongoose from "mongoose";
import bcrypt from "bcrypt";

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String, // email or phone
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
      select: false,
    },

    purpose: {
      type: String,
      enum: ["login", "verify_email", "reset_password"],
      required: true,
    },

    otpExpiresAt: {
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

// TTL index (auto delete expired OTPs)
otpSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Faster lookup
otpSchema.index({ identifier: 1, purpose: 1 });

// Hash OTP
otpSchema.pre("save", async function () {
  if (this.isModified("otp")) {
    this.otp = await bcrypt.hash(this.otp, 10);
  }
});

// Compare OTP
otpSchema.methods.isOtpCorrect = async function (inputOtp) {
  return await bcrypt.compare(inputOtp.toString(), this.otp);
};

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;