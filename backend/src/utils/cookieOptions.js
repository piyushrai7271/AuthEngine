// access token options
const getAccessTokenOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax", // this is only correct if frontend on different doman
    maxAge: 15 * 60 * 1000,
  };
};

// refresh token options
const getRefreshTokenOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax", // this is only correct if frontend on different doman
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export { getAccessTokenOptions, getRefreshTokenOptions };
