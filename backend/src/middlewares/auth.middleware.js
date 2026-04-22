import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

const jwtAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decodedToken?._id) {
      throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    next(error);
  }
};

export default jwtAuth;