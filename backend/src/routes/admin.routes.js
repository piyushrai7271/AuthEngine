import express from "express";
import jwtAuth from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  getAllUsersSchema,
  userIdParamSchema,
  getActiveSessionsSchema,
  getSecurityLogsSchema,
} from "../validators/admin.validators.js";

import {
  getDashboardOverview,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getActiveSessions,
  revokeSession,
  getSecurityLogs,
} from "../controllers/admin.controller.js";

const router = express.Router();

// protect all admin routes
router.use(jwtAuth, requireAdmin);

// dashboard
router.get(
  "/dashboard-overview",
  getDashboardOverview,
);

// users
router.get(
  "/users",
  validate(getAllUsersSchema, "query"),
  getAllUsers,
);

router.patch(
  "/users/:id/block",
  validate(userIdParamSchema, "params"),
  blockUser,
);

router.patch(
  "/users/:id/unblock",
  validate(userIdParamSchema, "params"),
  unblockUser,
);

router.delete(
  "/users/:id",
  validate(userIdParamSchema, "params"),
  deleteUser,
);

// sessions
router.get(
  "/sessions",
  validate(getActiveSessionsSchema, "query"),
  getActiveSessions,
);

router.patch(
  "/sessions/:id/revoke",
  validate(userIdParamSchema, "params"),
  revokeSession,
);

// security logs
router.get(
  "/security-logs",
  validate(getSecurityLogsSchema, "query"),
  getSecurityLogs,
);

export default router;