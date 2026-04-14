import express from "express";
import {
  addRiderProfile,
  getRiderProfile,
  toggleRiderAvailability,
} from "../controllers/rider.controller.js";
import isAuth from "../middlewares/isAuth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

// Define rider-specific routes here
router.get("/profile", isAuth, getRiderProfile);
router.patch("/toggle-availability", isAuth, toggleRiderAvailability);
router.post("/new", isAuth, upload, addRiderProfile);

export default router;
