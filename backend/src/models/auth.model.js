import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const providerSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      required: true,
    },
    providerId: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    providers: [providerSchema],

    // Account status
    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    // RBAC
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },
    lockCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// indexes
userSchema.index({ "providers.providerId": 1 });
userSchema.index({ "providers.provider": 1, "providers.providerId": 1 });

// hash password
userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// compare password
userSchema.methods.isPasswordCorrect = async function (inputPassword) {
  return await bcrypt.compare(inputPassword.toString(), this.password);
};

// access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

// refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

// otp token
userSchema.methods.generateOtpToken = function (identifier, purpose) {
  return jwt.sign(
    {
      _id: this._id,
      identifier,
      purpose, //
    },
    process.env.OTP_TOKEN_SECRET,
    {
      expiresIn: process.env.OTP_TOKEN_EXPIRY,
    },
  );
};

// reset token
userSchema.methods.generateResetToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      purpose: "password_reset",
    },
    process.env.RESET_TOKEN_SECRET,
    {
      expiresIn: process.env.RESET_TOKEN_EXPIRY,
    },
  );
};

// account locking methods
userSchema.methods.isAccountLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};


// increment failed login attempts
userSchema.methods.incrementLoginAttempts =
  async function () {

    // previous lock expired
    if (
      this.lockUntil &&
      this.lockUntil < Date.now()
    ) {
      this.failedLoginAttempts = 0;
      this.lockUntil = null;
    }

    // increment attempts
    this.failedLoginAttempts += 1;

    // lock after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {

      // increase lock count
      this.lockCount += 1;

      // exponential cooldown
      const lockTime =
        15 *
        60 *
        1000 *
        Math.pow(2, this.lockCount - 1);

      this.lockUntil = new Date(
        Date.now() + lockTime
      );

      // reset attempts after lock
      this.failedLoginAttempts = 0;
    }

    return await this.save();
  };

// reset login attempts
userSchema.methods.resetLoginAttempts =
  async function () {

    this.failedLoginAttempts = 0;
    this.lockUntil = null;
    this.lockCount = 0;

    return await this.save();
  };

const User = mongoose.model("User", userSchema);
export default User;
