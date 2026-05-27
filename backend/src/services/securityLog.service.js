import AuditLog from "../models/auditLog.model.js";

const createSecurityLog = async ({
  action,
  performedBy = null,
  targetUser = null,
  req = null,
  status = "SUCCESS",
  message = null,
}) => {
  try {
    await AuditLog.create({
      action,

      performedBy,

      targetUser,

      ipAddress: req?.ip || null,

      userAgent: req?.headers["user-agent"] || null,

      status,

      message,
    });
  } catch (error) {
    console.error("Security Log Error:", error.message);
  }
};

export default createSecurityLog;
