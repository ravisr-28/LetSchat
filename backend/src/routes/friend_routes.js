import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  removeFriend,
} from "../controller/friend_controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const friendRouter = express.Router();

friendRouter.use(protectedRoute);

friendRouter.post("/request/:id", sendFriendRequest);
friendRouter.put("/accept/:id", acceptFriendRequest);
friendRouter.put("/decline/:id", declineFriendRequest);
friendRouter.delete("/cancel/:id", cancelFriendRequest);
friendRouter.get("/list", getFriends);
friendRouter.get("/pending", getPendingRequests);
friendRouter.get("/sent", getSentRequests);
friendRouter.delete("/remove/:id", removeFriend);

export default friendRouter;
