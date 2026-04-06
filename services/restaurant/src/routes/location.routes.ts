import { Router } from "express";
import { fetchLocation } from "../controllers/location.controller.js";
import isAuth from "../middlewares/isAuth.middleware.js";

const router = Router();

router.get("/reverse", fetchLocation);

export default router;
