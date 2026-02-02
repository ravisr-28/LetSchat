import { sendWelcomeEmail } from "../email/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import UserModel from "../models/user_model.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";

export const signUp = async (req,res)=>{
   const {username,email,password} = req.body;
   try {
if(!username || !email || !password){
    return res.status(400).json({message:"All fields are required"})
}
if(password.length < 8){
    return res.status(400).json({message:"Password must be at least 8 characters long"})
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if(!emailRegex.test(email)){
    return res.status(400).json({message:"Invalid email format"})
}

const user = await UserModel.findOne({email});
if(user){
    return res.status(400).json({message:"Email already exist"})
}
const randomPass = await bcrypt.genSalt(10);
const hashedPass = await bcrypt.hash(password,randomPass);

const newUser = new UserModel({
    username,
    email,
    password:hashedPass
})

if(newUser){
    const savedUser = await newUser.save();
    generateToken(savedUser._id,res);
    res.status(201).json({message:"User created successfully",user:newUser});

   try {
    await sendWelcomeEmail(savedUser.email,savedUser.username,ENV.CLIENT_URL);
   } catch (err) {
    console.log("Error sending welcome email:",err);
   }
}else{
   return res.status(400).json({message:"Failed to create user"})
}
   } catch (err) {
    console.log("Error in signup:",err);
    return res.status(500).json({message:"Server error"})
   }
}