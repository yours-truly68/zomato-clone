import { getChannel } from "./rabbitmq.config.js";

export const publichPaymentSuccess = async (payload: {
  orderId: string;
  paymentId: string;
  provider: "razorpay" | "stripe";
}) => {
  const channel = getChannel();
  if (!channel) {
    console.error("🐇 RabbitMQ channel is not available");
    return;
  }
  channel.sendToQueue(
    process.env.PAYMENT_QUEUE!,
    Buffer.from(JSON.stringify({ type: "PAYMENT_SUCCESS", data: payload })),
    { persistent: true },
  );
};
