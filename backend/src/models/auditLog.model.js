import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "LOGOUT",
        "PASSWORD_RESET",
        "PASSWORD_CHANGED",
        "OAUTH_LOGIN",
        "OTP_LOGIN",
        "USER_BLOCKED",
        "USER_UNBLOCKED",
        "USER_DELETED",
        "SESSION_REVOKED",
        "ADMIN_LOGIN",
      ],
    },

    // who performed the action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // target user on which action happened
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },

    message: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

// useful indexes
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;