import express from "express";
import authRouter from "./routes/auth_routes.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import cookieparser from "cookie-parser";
import cors from "cors";
import messageRouter from "./routes/message_routes.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieparser());
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}
server.listen(PORT, () => {
  console.log("App is listening on: " + PORT);
  connectDB();
});
