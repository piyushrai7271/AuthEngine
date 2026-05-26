import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../configs/redis.config.js";
import ApiResponse from "../utils/apiResponse.js";



// COMMON RESPONSE HANDLER..........
const rateLimitHandler = (message) => {
  return (req, res) => {
    return res.status(429).json(
      new ApiResponse(
        429,
        null,
        message,
      ),
    );
  };
};



// REDIS STORE...............
const createRedisStore = (prefix) => {
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix,
  });
};


// KEY GENERATORS................
// LOGIN IDENTIFIER
// LIMIT BASED ON:
// IP + EMAIL

const loginKeyGenerator = (req) => {
  const email =
    req.body?.email
      ?.trim()
      ?.toLowerCase() || "unknown";

  return `${ipKeyGenerator(req.ip)}-${email}`;
};


// OTP / REGISTER / RESET IDENTIFIER
// LIMIT BASED ON:
// IP + EMAIL/MOBILE

const otpKeyGenerator = (req) => {
  const identifier =
    req.body?.email
      ?.trim()
      ?.toLowerCase() ||
    req.body?.mobileNumber
      ?.trim() ||
    "unknown";

  return `${ipKeyGenerator(req.ip)}-${identifier}`;
};


// GLOBAL LIMITER...............
const globalRateLimiter = rateLimit({
  store: createRedisStore("global-limit:")
  ,

  windowMs: 15 * 60 * 1000,
  max: 200,

  handler: rateLimitHandler(
    "Too many requests from this IP. Please try again later.",
  ),

  standardHeaders: true,
  legacyHeaders: false,
});


// REGISTER LIMITER.................
const registerRateLimiter = rateLimit({
  store: createRedisStore("register-limit:"),

  windowMs: 15 * 60 * 1000,
  max: 5,

  keyGenerator: otpKeyGenerator,

  handler: rateLimitHandler(
    "Too many registration attempts. Please try again later.",
  ),

  standardHeaders: true,
  legacyHeaders: false,
});


// LOGIN LIMITER...............
const loginRateLimiter = rateLimit({
  store: createRedisStore("login-limit:"),

  windowMs: 10 * 60 * 1000,
  max: 5,

  // count only failed attempts
  skipSuccessfulRequests: true,

  // IP + EMAIL based limiting
  keyGenerator: loginKeyGenerator,

  handler: rateLimitHandler(
    "Too many login attempts. Please try again after 10 minutes.",
  ),

  standardHeaders: true,
  legacyHeaders: false,
});


// OTP SEND LIMITER...................
const otpSendRateLimiter = rateLimit({
  store: createRedisStore("otp-send-limit:"),

  windowMs: 10 * 60 * 1000,
  max: 3,

  keyGenerator: otpKeyGenerator,

  handler: rateLimitHandler(
    "Too many OTP requests. Please wait before requesting again.",
  ),

  standardHeaders: true,
  legacyHeaders: false,
});


// OTP VERIFY LIMITER....................
const otpVerifyRateLimiter = rateLimit({
  store: createRedisStore("otp-verify-limit:"),

  windowMs: 10 * 60 * 1000,
  max: 5,

  skipSuccessfulRequests: true,

  keyGenerator: otpKeyGenerator,

  handler: rateLimitHandler(
    "Too many OTP verification attempts. Please try again later.",
  ),

  standardHeaders: true,
  legacyHeaders: false,
});


// RESET PASSWORD LIMITER.................
const resetPasswordRateLimiter = rateLimit({
  store: createRedisStore("reset-password-limit:"),

  windowMs: 15 * 60 * 1000,
  max: 3,

  skipSuccessfulRequests: true,

  keyGenerator: otpKeyGenerator,

  handler: rateLimitHandler(
    "Too many password reset attempts. Please try again later.",
  ),

  standardHeaders: true,
  legacyHeaders: false,
});


// REFRESH TOKEN LIMITER.....
const refreshTokenRateLimiter = rateLimit({
  store: createRedisStore("refresh-token-limit:"),

  windowMs: 15 * 60 * 1000,
  max: 20,

  handler: rateLimitHandler(
    "Too many refresh token requests. Please try again later.",
  ),

  standardHeaders: true,
  legacyHeaders: false,
});


// ADMIN LIMITER.........
const adminRateLimiter = rateLimit({
  store: createRedisStore("admin-limit:"),

  windowMs: 15 * 60 * 1000,
  max: 100,

  handler: rateLimitHandler(
    "Too many admin requests. Please slow down.",
  ),

  standardHeaders: true,
  legacyHeaders: false,
});


// EXPORTS....................
export {
  globalRateLimiter,
  registerRateLimiter,
  loginRateLimiter,
  otpSendRateLimiter,
  otpVerifyRateLimiter,
  resetPasswordRateLimiter,
  refreshTokenRateLimiter,
  adminRateLimiter,
};