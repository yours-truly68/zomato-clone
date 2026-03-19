import { Router } from "express";
import isAuth, { isSeller } from "../middlewares/isAuth.middleware.js";
import { addRestaurant } from "../controllers/restaurant.controller.js";
const router = Router();
router.post("/new", isAuth, isSeller, addRestaurant);
export default router;
