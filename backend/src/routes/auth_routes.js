import express from "express";
import { signUp,Login,Logout} from "../controller/auth_controller.js";

const authRouter = express.Router()
authRouter.post("/signup",signUp);
authRouter.post("/login",Login);
authRouter.post("/logout",Logout);

export default authRouter;