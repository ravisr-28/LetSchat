import express from "express";
import { signUp } from "../controller/auth_controller.js";

const authRouter = express.Router()
authRouter.post("/signup",signUp)

export default authRouter;