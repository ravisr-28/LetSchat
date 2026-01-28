import express from "express"
import dotenv from "dotenv"
import authRouter from "./routes/auth_routes.js";
import path from "path";

dotenv.config()

const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use("/api/auth",authRouter);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
}
app.listen(PORT,()=>{
    console.log("App is listening on: " +PORT)
})