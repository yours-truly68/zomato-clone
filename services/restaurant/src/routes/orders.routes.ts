import { Router } from "express";
import isAuth, { isSeller } from "../middlewares/isAuth.middleware.js";
import {
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
router.get("/:restaurantId", fetchRestaurantOrders);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);

export default router;
