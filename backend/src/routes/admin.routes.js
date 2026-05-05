import express from "express";
import jwtAuth from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

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
router.get("/dashboard-overview", getDashboardOverview);

// users
router.get("/users", getAllUsers);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUser);

// sessions
router.get("/sessions", getActiveSessions);
router.patch("/sessions/:id/revoke", revokeSession);

// security logs
router.get("/security-logs", getSecurityLogs);

export default router;