import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();
const { RAZOR_PAY_KEY_SECRET, RAZOR_PAY_API_KEY } = process.env;
if (!RAZOR_PAY_KEY_SECRET || !RAZOR_PAY_API_KEY) {
    throw new Error("Missing Razorpay configuration in environment variables");
}
const razorpayInstance = new Razorpay({
    key_id: RAZOR_PAY_API_KEY,
    key_secret: RAZOR_PAY_KEY_SECRET,
});
export default razorpayInstance;
