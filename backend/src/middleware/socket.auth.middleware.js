import jwt from "jsonwebtoken";
import UserModel from "../models/user_model.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    if (!token) {
      console.log("Socket connection rejected: No token provide");
      return next(new Error("Unauthorized - Invalid token"));
    }

    const decodedToken = jwt.verify(token, ENV.JWT_SECRET);
    if (!decodedToken) {
      console.log("Socket connection rejected: Invalid token");
      return next(new Error("Unauthorized - Invalid token"));
    }
    const user = await UserModel.findById(decodedToken.userId).select(
      "-password",
    );
    if (!user) {
      console.log("Socket connection rejected: User not found");
      return next(new Error("Unauthorized - User not found"));
    }
    socket.user = user;
    socket.userId = user._id.toString();
    console.log(
      `Socket connection accepted for user: ${user.username} (${user._id})`,
    );
    next();
  } catch (error) {
    console.log("Socket connection rejected: Invalid token", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};
