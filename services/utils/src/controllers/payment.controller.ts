import axios from "axios";
import { Request, Response } from "express";
import razorpayInstance from "../config/razorpay.config.js";

export const createRazorpayOrder = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const { data } = await axios.get(
    `${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`,
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
      },
    },
  );

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: data.amount * 100, //Convert to paise,
    currency: "INR",
    receipt: orderId,
  });

  res.json({
    razorpayOrderId: razorpayOrder.id,
    key: process.env.RAZOR_PAY_KEY_SECRET!,
  });
};
