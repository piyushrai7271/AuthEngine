import Session from "../models/session.model.js";
import ms from "ms";

export const generateAccessAndRefreshToken = async (user, req) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  await Session.create({
    user: user._id,
    refreshToken,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY)),
  });

  return { accessToken, refreshToken };
};
