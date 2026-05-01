import express from "express";
import {
  googleAuthRedirect,
  googleAuthCallback,
  githubAuthRedirect,
  githubAuthCallback,
} from "../controllers/oauth.controller.js";

const router = express.Router();

// 🔐 Google OAuth
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);

// 🔐 Google OAuth
router.get("/github", githubAuthRedirect);
router.get("/github/callback", githubAuthCallback);

export default router;
