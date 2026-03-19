import express from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const app = express();

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
  throw new Error("Missing Cloudinary configuration in environment variables");
}
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET
})

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Utils is listenting on port: ${PORT}`);
});
