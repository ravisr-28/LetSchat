import jwt from "jsonwebtoken";
import UserModel from "../models/user_model.js";
import { ENV } from "../lib/env.js";
export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });
    }
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - invalid token" });
    }
    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Unauthorized - user not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("Error in protected route middleware:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
