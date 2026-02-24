import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
})

console.log("Cloud:", ENV.CLOUDINARY_CLOUD_NAME);
console.log("Key:", ENV.CLOUDINARY_API_KEY);
console.log("Secret:", ENV.CLOUDINARY_API_SECRET);

export default cloudinary;