import axios from "axios";
import querystring from "querystring";
import { randomBytes } from "crypto";
import ApiError from "../utils/apiError.js";
import User from "../models/auth.model.js";
import { sendOtp } from "../services/otp.service.js";
import { generateAccessAndRefreshToken } from "../services/token.service.js";
import {
  getAccessTokenOptions,
  getRefreshTokenOptions,
} from "../utils/cookieOptions.js";

const GOOGLE_CONFIG = {
  baseUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
  scopes: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ],
  timeout: 10000,
};

const GITHUB_CONFIG = {
  baseUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  userUrl: "https://api.github.com/user",
  emailUrl: "https://api.github.com/user/emails",
  scope: "read:user user:email",
  timeout: 10000,
};

//GOOGLE OAUTH
const googleAuthRedirect = async (req, res, next) => {
  try {
    // 1️⃣ Generate CSRF state
    const state = randomBytes(32).toString("hex");
    req.session.oauthState = state;
    req.session.save();

    const params = querystring.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      response_type: "code",
      scope: GOOGLE_CONFIG.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state, // ✅ CSRF protection
    });

    const url = `${GOOGLE_CONFIG.baseUrl}?${params}`;

    return res.redirect(url);
  } catch (error) {
    next(error);
  }
};
const googleAuthCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      throw new ApiError(400, "Authorization code not found");
    }

    // ✅ CSRF check
    if (!state || state !== req.session.oauthState) {
      throw new ApiError(403, "Invalid OAuth state");
    }
    delete req.session.oauthState;

    // 1️⃣ Get access token
    const tokenResponse = await axios.post(
      GOOGLE_CONFIG.tokenUrl,
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      },
      { timeout: GOOGLE_CONFIG.timeout },
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      throw new ApiError(401, "Invalid Google access token");
    }

    // 2️⃣ Get user info
    const userInfoResponse = await axios.get(GOOGLE_CONFIG.userInfoUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
      timeout: GOOGLE_CONFIG.timeout,
    });

    const { 
      id,
      email, 
      name, 
      verified_email 
    } = userInfoResponse.data;

    const providerId = String(id);


    if (!email || !verified_email) {
      throw new ApiError(400, "Invalid Google account email");
    }

    // 3️⃣ Find user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name || "User",
        email,
        providers: [
          {
            provider: "google",
            providerId,
          },
        ],
        isVerified: true,
      });
    } else {
      if (user.isBlocked) {
        throw new ApiError(403, "Account is blocked");
      }

      const existingProvider = user.providers.find(
        (p) => p.provider === "google",
      );

      if (existingProvider) {
        if (existingProvider.providerId !== providerId) {
          throw new ApiError(
            403,
            "This email is already linked with another Google account",
          );
        }
      } else {
        user.providers.push({
          provider: "google",
          providerId,
        });
        await user.save();
      }
    }

    // ✅ 🔥 ADMIN 2FA CHECK
    if (user.role === "admin") {
      const identifier = user.email;

      // send OTP
      await sendOtp({
        identifier,
        purpose: "login",
      });

      const otpToken = user.generateOtpToken(identifier, "login");

      // redirect to frontend OTP page
      const redirectUrl = new URL(process.env.FRONTEND_SUCCESS_REDIRECT_URL);
      redirectUrl.pathname = "/otp";
      redirectUrl.searchParams.append("otpToken", otpToken);
      redirectUrl.searchParams.append("type", "oauth");

      return res.redirect(redirectUrl.toString());
    }

    // 4️⃣ Normal user login
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user,
      req,
    );

    return res
      .cookie("accessToken", accessToken, getAccessTokenOptions())
      .cookie("refreshToken", refreshToken, getRefreshTokenOptions())
      .redirect(process.env.FRONTEND_SUCCESS_REDIRECT_URL);
  } catch (error) {
    const redirectUrl = new URL(process.env.FRONTEND_FAILURE_REDIRECT_URL);
    redirectUrl.searchParams.append("error", "GOOGLE_AUTH_FAILED");

    return res.redirect(redirectUrl.toString());
  }
};

// GITHUB OAUTH
const githubAuthRedirect = async (req, res, next) => {
  try {
    const state = randomBytes(32).toString("hex");

    req.session.oauthState = state;

    await req.session.save(); // 🔥 VERY IMPORTANT

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
      scope: GITHUB_CONFIG.scope,
      state,
      allow_signup: "true",
    }).toString();

    return res.redirect(`${GITHUB_CONFIG.baseUrl}?${params}`);
  } catch (error) {
    next(error);
  }
};
const githubAuthCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    // 1️⃣ Validate inputs
    if (!code) {
      throw new ApiError(400, "Authorization code not found");
    }

    // ✅ CSRF validation
    if (!state || state !== req.session.oauthState) {
      throw new ApiError(403, "CSRF validation failed - state mismatch");
    }
    delete req.session.oauthState;

    // 2️⃣ Exchange code for access token
    let tokenRes;
    try {
      tokenRes = await axios.post(
        GITHUB_CONFIG.tokenUrl,
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: "application/json",
          },
          timeout: GITHUB_CONFIG.timeout,
        },
      );
    } catch (error) {
      throw new ApiError(401, "Failed to obtain GitHub access token");
    }

    const access_token = tokenRes.data.access_token;

    // ✅ Validate access token
    if (!access_token) {
      throw new ApiError(401, "Invalid access token received from GitHub");
    }

    // 3️⃣ Get user profile
    let userRes;
    try {
      userRes = await axios.get(GITHUB_CONFIG.userUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        timeout: GITHUB_CONFIG.timeout,
      });
    } catch (error) {
      throw new ApiError(401, "Failed to fetch GitHub user info");
    }

    const { id, name } = userRes.data;

    const providerId = String(id);

    // 4️⃣ Get email (GitHub separate API)
    let emailRes;
    try {
      emailRes = await axios.get(GITHUB_CONFIG.emailUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        timeout: GITHUB_CONFIG.timeout,
      });
    } catch (error) {
      throw new ApiError(401, "Failed to fetch GitHub email");
    }

    // ✅ Find primary verified email
    const primaryEmailObj = emailRes.data.find((e) => e.primary && e.verified);

    const email = primaryEmailObj?.email;

    if (!email) {
      throw new ApiError(
        403,
        "No verified primary email found on GitHub account",
      );
    }

    // 5️⃣ Find existing user
    let user = await User.findOne({ email });

    if (!user) {
      // ✅ Create new user
      user = await User.create({
        fullName: name || "GitHub User",
        email,
        providers: [
          {
            provider: "github",
            providerId,
          },
        ],
        isVerified: true,
      });
    } else {
      // 🔒 SECURITY CHECKS

      // ✅ Check if account is blocked
      if (user.isBlocked) {
        throw new ApiError(403, "Your account has been blocked");
      }

      // ✅ Check provider linking - avoid account takeover
      const existingProvider = user.providers.find(
        (p) => p.provider === "github",
      );

      if (existingProvider) {
        if (existingProvider.providerId !== providerId) {
          throw new ApiError(
            403,
            "This email is already linked with another GitHub account",
          );
        }
      } else {
        user.providers.push({
          provider: "github",
          providerId,
        });
        await user.save();
      }
    }

    // ✅ 🔥 ADMIN 2FA CHECK (ADD THIS BLOCK HERE)
    if (user.role === "admin") {
      const identifier = user.email;

      await sendOtp({
        identifier,
        purpose: "login",
      });

      const otpToken = user.generateOtpToken(identifier, "login");

      const redirectUrl = new URL(process.env.FRONTEND_SUCCESS_REDIRECT_URL);
      redirectUrl.pathname = "/otp";
      redirectUrl.searchParams.append("otpToken", otpToken);
      redirectUrl.searchParams.append("type", "oauth");

      return res.redirect(redirectUrl.toString());
    }

    // 6️⃣ Generate tokens + session
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user,
      req,
    );

    // 7️⃣ Set cookies + redirect
    return res
      .cookie("accessToken", accessToken, getAccessTokenOptions())
      .cookie("refreshToken", refreshToken, getRefreshTokenOptions())
      .redirect(process.env.FRONTEND_SUCCESS_REDIRECT_URL);
  } catch (error) {
    // Error handling with proper redirect
    const redirectUrl = new URL(process.env.FRONTEND_FAILURE_REDIRECT_URL);
    redirectUrl.searchParams.append("error", "AUTH_FAILED");
    redirectUrl.searchParams.append(
      "message",
      error.message || "OAuth login failed",
    );
    return res.redirect(redirectUrl.toString());
  }
};

export {
  googleAuthRedirect,
  googleAuthCallback,
  githubAuthRedirect,
  githubAuthCallback,
};
