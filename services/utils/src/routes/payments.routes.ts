import express, { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);

export default router;
