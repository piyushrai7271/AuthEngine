import Session from "../models/session.model.js";

export const generateAccessAndRefreshToken = async (user, req) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  await Session.create({
    user: user._id,
    refreshToken,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
  };
};
