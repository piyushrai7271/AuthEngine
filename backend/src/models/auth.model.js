import mongoose from "mongoose";

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
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      trim: true,
    },

    avatar: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },

    // 🔐 Authentication
    password: {
      type: String,
      select: false,
    },

    providers: [providerSchema],

    // 🛡️ Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    // 👤 Role (RBAC)
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // 🔐 Security
    lastLogin: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ mobileNumber: 1 });

// Ensure at least one provider
userSchema.pre("save", function (next) {
  if (!this.providers || this.providers.length === 0) {
    this.providers = [{ provider: "local" }];
  }
  next();
});

export default mongoose.model("User", userSchema);