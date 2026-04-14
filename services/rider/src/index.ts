import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.config.js";

dotenv.config();

const PORT = process.env.PORT || 8005;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Rider is listening on port: ${PORT}`);
  connectDB();
});
