import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes.js";
dotenv.config();
const PORT = process.env.PORT || 8006;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(PORT, () => {
    console.log(`Admin service is running on port ${PORT}`);
});
app.use("/api/admin", adminRoutes);
