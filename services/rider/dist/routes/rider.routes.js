import express from "express";
import { acceptOrderByRider, addRiderProfile, fetchMyCurrentOrder, getRiderProfile, toggleRiderAvailability, updateOrderStatus, } from "../controllers/rider.controller.js";
import isAuth from "../middlewares/isAuth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router = express.Router();
// Define rider-specific routes here
router.get("/profile", isAuth, getRiderProfile);
router.patch("/toggle-availability", isAuth, toggleRiderAvailability);
router.post("/new", isAuth, upload, addRiderProfile);
router.post("/accept/:orderId", isAuth, acceptOrderByRider);
router.get("/order/current", isAuth, fetchMyCurrentOrder);
router.patch("/update/:orderId/status", isAuth, updateOrderStatus);
export default router;
