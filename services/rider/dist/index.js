import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.config.js";
import riderRoutes from "./routes/rider.routes.js";
dotenv.config();
const PORT = process.env.PORT || 8005;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/rider", riderRoutes);
app.listen(PORT, () => {
    console.log(`Rider is listening on port: ${PORT}`);
    connectDB();
});
