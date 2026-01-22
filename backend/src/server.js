import express from "express"
import dotenv from "dotenv"
import authRouter from "./routes/auth_routes.js";

dotenv.config()

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/api/auth",authRouter)
app.listen(PORT,()=>{
    console.log("App is listening on: " +PORT)
})