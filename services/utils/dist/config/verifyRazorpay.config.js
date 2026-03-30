import crypto from "crypto";
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZOR_PAY_KEY_SECRET)
        .update(body)
        .digest("hex");
    return expectedSignature === signature;
};
// The above function is not needed as Razorpay's Node.js SDK provides built-in methods for signature verification.
// export const verifyRazorpaySignature = (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean => {
//   const generatedSignature = crypto
//     .createHmac("sha256", process.env.RAZOR_PAY_KEY_SECRET!)
//     .update(`${razorpayOrderId}|${razorpayPaymentId}`)
//     .digest("hex");
//   return generatedSignature === razorpaySignature;
// }
