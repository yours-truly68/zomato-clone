import express from "express";
import isAuth from "../middlewares/isAuth.middleware.js";
import { addToCart, fetchMyCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add-to-cart", isAuth, addToCart);
router.post("/all", isAuth, fetchMyCart);

export default router;
