import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/auth.model.js";
import Session from "../models/session.model.js";
import AuditLog from "../models/auditLog.model.js";

const getDashboardOverview = asyncHandler(async (req, res) => {
  // users stats
  const totalUsers = await User.countDocuments();

  const totalAdmins = await User.countDocuments({
    role: "admin",
  });

  const blockedUsers = await User.countDocuments({
    isBlocked: true,
  });

  const verifiedUsers = await User.countDocuments({
    isVerified: true,
  });

  // provider stats
  const googleUsers = await User.countDocuments({
    providers: {
      $elemMatch: {
        provider: "google",
      },
    },
  });

  const githubUsers = await User.countDocuments({
    providers: {
      $elemMatch: {
        provider: "github",
      },
    },
  });

  const localUsers = await User.countDocuments({
    password: {
      $exists: true,
      $ne: null,
    },
  });

  // active sessions
  const activeSessions = await Session.countDocuments({
    isValid: true,
    expiresAt: { $gt: new Date() },
  });

  // recent security logs
  const recentActivities = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("performedBy", "fullName email role")
    .populate("targetUser", "fullName email role");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: {
          totalUsers,
          totalAdmins,
          blockedUsers,
          verifiedUsers,
        },

        authProviders: {
          localUsers,
          googleUsers,
          githubUsers,
        },

        sessions: {
          activeSessions,
        },

        recentActivities,
      },
      "Dashboard overview fetched successfully",
    ),
  );
});
const getAllUsers = asyncHandler(async (req, res) => {
  // query params
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search?.trim() || "";
  const blocked = req.query.blocked;

  // skip for pagination
  const skip = (page - 1) * limit;

  // ✅ only normal users
  const filter = {
    role: "user",
  };

  // search by fullName or email
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // filter blocked/unblocked
  if (blocked === "true") {
    filter.isBlocked = true;
  }

  if (blocked === "false") {
    filter.isBlocked = false;
  }

  // fetch users
  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // total users count
  const totalUsers = await User.countDocuments(filter);

  // pagination info
  const totalPages = Math.ceil(totalUsers / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      "Users fetched successfully"
    )
  );
});
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // prevent self block
  if (req.userId.toString() === id) {
    throw new ApiError(400, "You cannot block yourself");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isBlocked) {
    throw new ApiError(400, "User already blocked");
  }

  // block user
  user.isBlocked = true;
  await user.save();

  // invalidate all sessions
  await Session.updateMany(
    { user: user._id },
    { isValid: false }
  );

  // audit log
  await AuditLog.create({
    action: "USER_BLOCKED",
    performedBy: req.userId,
    targetUser: user._id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    status: "SUCCESS",
    message: `User ${user.email} blocked by admin`,
  });

  return res.status(200).json(
    new ApiResponse(200, null, "User blocked successfully")
  );
});
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isBlocked) {
    throw new ApiError(400, "User is not blocked");
  }

  // unblock user
  user.isBlocked = false;
  await user.save();

  // audit log
  await AuditLog.create({
    action: "USER_UNBLOCKED",
    performedBy: req.userId,
    targetUser: user._id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    status: "SUCCESS",
    message: `User ${user.email} unblocked by admin`,
  });

  return res.status(200).json(
    new ApiResponse(200, null, "User unblocked successfully")
  );
});
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // prevent self delete
  if (req.userId.toString() === id) {
    throw new ApiError(400, "You cannot delete yourself");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // delete user sessions
  await Session.deleteMany({
    user: user._id,
  });

  // optional: delete otp records
  await OTP.deleteMany({
    identifier: {
      $in: [user.email, user.mobileNumber],
    },
  });

  // audit log
  await AuditLog.create({
    action: "USER_DELETED",
    performedBy: req.userId,
    targetUser: user._id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    status: "SUCCESS",
    message: `User ${user.email} deleted by admin`,
  });

  // delete user
  await user.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "User deleted successfully")
  );
});
const getActiveSessions = asyncHandler(async (req, res) => {
  // query params
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  // fetch active sessions
  const sessions = await Session.find({
    isValid: true,
    expiresAt: { $gt: new Date() },
  })
    .populate("user", "fullName email role isBlocked")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // total sessions
  const totalSessions = await Session.countDocuments({
    isValid: true,
    expiresAt: { $gt: new Date() },
  });

  const totalPages = Math.ceil(totalSessions / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sessions,
        pagination: {
          totalSessions,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      "Active sessions fetched successfully",
    ),
  );
});
const revokeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // find session
  const session = await Session.findById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // already revoked
  if (!session.isValid) {
    throw new ApiError(400, "Session already revoked");
  }

  // revoke session
  session.isValid = false;
  await session.save();

  // audit log
  await AuditLog.create({
    action: "SESSION_REVOKED",
    performedBy: req.userId,
    targetUser: session.user,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    status: "SUCCESS",
    message: "Session revoked by admin",
  });

  return res.status(200).json(
    new ApiResponse(200, null, "Session revoked successfully"),
  );
});
const getSecurityLogs = asyncHandler(async (req, res) => {
  // query params
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const action = req.query.action;
  const status = req.query.status;

  const skip = (page - 1) * limit;

  // filters
  const filter = {};

  if (action) {
    filter.action = action;
  }

  if (status) {
    filter.status = status;
  }

  // fetch logs
  const logs = await AuditLog.find(filter)
    .populate("performedBy", "fullName email role")
    .populate("targetUser", "fullName email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // total logs
  const totalLogs = await AuditLog.countDocuments(filter);

  const totalPages = Math.ceil(totalLogs / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        logs,
        pagination: {
          totalLogs,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      "Security logs fetched successfully",
    ),
  );
});


export {
    getDashboardOverview,
    getAllUsers,
    blockUser,
    unblockUser,
    deleteUser,
    getActiveSessions,
    revokeSession,
    getSecurityLogs
}