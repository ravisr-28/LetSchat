import express from "express";
import { signUp,Login,Logout,updateProfile} from "../controller/auth_controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const authRouter = express.Router();
authRouter.use(arcjetProtection)
authRouter.post("/signup",signUp);
authRouter.post("/login",arcjetProtection,Login);
authRouter.post("/logout",Logout);
authRouter.put("/update-profile",protectedRoute,updateProfile);

authRouter.get("/check", protectedRoute,(req,res) => res.status(200).json({ message: "You are authenticated", user: req.user }));

export default authRouter;