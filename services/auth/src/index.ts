import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.routes.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://zomato-clone-1d3p.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Auth listening on port: ${PORT}`);
  connectDB();
});
