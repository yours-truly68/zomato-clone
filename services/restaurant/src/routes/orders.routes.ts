import { Router } from "express";
import isAuth, { isSeller } from "../middlewares/isAuth.middleware.js";
import {
  assignOrderToRider,
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrders,
  getCurrentOrdersForRider,
  getMyOrders,
  getSingleOrder,
  updateOrderStatus,
  updateOrderStatusByRider,
} from "../controllers/order.controller.js";

const router = Router();

router.get("/my", isAuth, getMyOrders);
router.get("/my/:orderId", isAuth, getSingleOrder);
router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
router.get("/:restaurantId", isAuth, isSeller, fetchRestaurantOrders);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);
router.put("/assign/rider", assignOrderToRider);
router.get("/rider/order/:riderId", isAuth, getCurrentOrdersForRider);
router.put("/update/rider/status", isAuth, updateOrderStatusByRider);
export default router;
