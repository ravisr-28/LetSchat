import express from "express"
import authRouter from "./routes/auth_routes.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;
app.use(express.json());
app.use("/api/auth",authRouter);

if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
}
app.listen(PORT,()=>{
    console.log("App is listening on: " +PORT);
    connectDB();
})