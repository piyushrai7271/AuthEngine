import express from "express";
import jwtAuth from "../middlewares/auth.middleware.js";
import {
  register,
  loginWithPassword,
  refreshAccessToken,
  logOutUser,
  logOutAllDevices,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginWithPassword);
router.post("/refresh-token", refreshAccessToken);

// protected routes
router.post("/logout", jwtAuth, logOutUser);
router.post("/logout-all", jwtAuth, logOutAllDevices);

export default router;