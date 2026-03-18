import express from "express";
import dotenv from "dotenv";
import connectDB  from "./config/db.js";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;


app.listen(PORT, () => {
  console.log(`Restaurant service is running on post ${PORT}`);
  connectDB();
});
