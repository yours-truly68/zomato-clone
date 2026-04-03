import axios from "axios";
import razorpayInstance from "../config/razorpay.config.js";
import { verifyRazorpaySignature } from "../config/verifyRazorpay.config.js";
import { publichPaymentSuccess } from "../config/payment.producer.js";
export const createRazorpayOrder = async (req, res) => {
    const { orderId } = req.body;
    const { data } = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
    });
    const razorpayOrder = await razorpayInstance.orders.create({
        amount: data.amount * 100, //Convert to paise,
        currency: "INR",
        receipt: orderId,
    });
    res.json({
        razorpayOrderId: razorpayOrder.id,
        key: process.env.RAZOR_PAY_API_KEY,
    });
};
export const verifyRazorpayPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, } = req.body;
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
        return res.status(400).json({ message: "Invalid payment signature" });
    }
    // Update order status in the restaurant service
    await publichPaymentSuccess({
        orderId,
        paymentId: razorpay_payment_id,
        provider: "razorpay",
    });
    res.json({ message: "Payment verified successfully" });
};
