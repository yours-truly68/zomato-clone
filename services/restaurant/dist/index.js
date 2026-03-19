import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import restaurantRoutes from "./routes/rsetaurant.route.js";
dotenv.config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5001;
app.use("/api/restaurant", restaurantRoutes);
app.listen(PORT, () => {
    console.log(`Restaurant service is running on post ${PORT}`);
    connectDB();
});
