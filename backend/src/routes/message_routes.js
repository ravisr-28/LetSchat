import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  getLastMessages,
  sendMessage,
  deleteMessage,
  deleteChat,
} from "../controller/message_controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const messageRouter = express.Router();

messageRouter.use(arcjetProtection, protectedRoute);

messageRouter.get("/contact", getAllContacts);
messageRouter.get("/chats", getChatPartners);
messageRouter.get("/last-messages", getLastMessages);
messageRouter.get("/:id", getMessagesByUserId);
messageRouter.post("/send/:id", sendMessage);
messageRouter.delete("/delete/:id", deleteMessage);
messageRouter.delete("/chat/:id", deleteChat);

export default messageRouter;
