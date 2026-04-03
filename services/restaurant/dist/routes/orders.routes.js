import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware.js";
import { createOrder, fetchOrderForPayment, } from "../controllers/order.controller.js";
const router = Router();
router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
export default router;
