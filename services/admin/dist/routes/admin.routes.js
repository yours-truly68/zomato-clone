import { Router } from "express";
import { isAdmin, isAuth } from "../middleware/isAuth.middleware.js";
import { getPendingRestaurants, getPendingRiders, verifyRestaurant, verifyRider, } from "../controllers/admin.controller.js";
const adminRoutes = Router();
adminRoutes.get("/restaurant/pending", isAuth, isAdmin, getPendingRestaurants);
adminRoutes.get("/rider/pending", isAuth, isAdmin, getPendingRiders);
adminRoutes.patch("/verify/restaurant/:id", isAuth, isAdmin, verifyRestaurant);
adminRoutes.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);
export default adminRoutes;
