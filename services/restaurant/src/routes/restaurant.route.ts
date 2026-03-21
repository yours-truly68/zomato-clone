import { Router } from "express";
import isAuth, { isSeller } from "../middlewares/isAuth.middleware.js";
import {
  addRestaurant,
  getRestaurant,
} from "../controllers/restaurant.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/new", isAuth, isSeller, upload, addRestaurant);
router.get("/my", isAuth, isSeller, getRestaurant);

export default router;
