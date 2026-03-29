import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware.js";
import { createAddress, deleteAddress, getMyAddresses, } from "../controllers/address.controller.js";
const router = Router();
router.get("/all", isAuth, getMyAddresses);
router.post("/new", isAuth, createAddress);
router.delete("/delete/:id", isAuth, deleteAddress);
export default router;
