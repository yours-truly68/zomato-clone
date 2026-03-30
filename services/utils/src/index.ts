import express from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import uploadRoutes from "./routes/cloudinary.routes.js";
import { connectToRabbitMQ } from "./config/rabbitmq.config.js";

dotenv.config();
connectToRabbitMQ();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
  throw new Error("Missing Cloudinary configuration in environment variables");
}
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});

app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`Utils is listenting on port: ${PORT}`);
});
