import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshToken: {
      type: String,
      required: true,
      select: false,
    },

    userAgent: {
      type: String,
    },

    ipAddress: {
      type: String,
    },

    isValid: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Important for performance
sessionSchema.index({ refreshToken: 1 });

const Session = mongoose.model("Session", sessionSchema);
export default Session;