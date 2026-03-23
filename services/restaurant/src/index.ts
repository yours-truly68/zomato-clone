import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import restaurantRoutes from "./routes/restaurant.route.js";
import cors from "cors";
import itemRoutes from "./routes/menuItems.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8001;

app.use("/api/restaurant", restaurantRoutes);
app.use("/api/item", itemRoutes);

app.listen(PORT, () => {
  console.log(`Restaurant service is running on post ${PORT}`);
  connectDB();
});
