import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";


const jwtAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken?._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    next(error);
  }
};

export default jwtAuth;
