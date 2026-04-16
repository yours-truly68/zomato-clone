import axios from "axios";
import Order from "../models/Orders.model.js";
import { getChannel } from "./rabbitmq.config.js";

export const startPaymentConsumer = async () => {
  const channel = getChannel();
  if (!channel) {
    console.error("🐇 RabbitMQ channel is not available");
    return;
  }

  channel.consume(process.env.PAYMENT_QUEUE!, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      if (event.type !== "PAYMENT_SUCCESS") {
        channel.ack(msg);
        return;
      }

      const { orderId } = event.data;

      const order = await Order.findOneAndUpdate(
        {
          _id: orderId,
          paymentStatus: { $ne: "paid" }, //double check to avoid processing already paid orders
          //also Idempotency check in case of message re-deliverty
        },
        {
          $set: {
            paymentStatus: "paid",
            status: "placed",
          },
          $unset: {
            expiresAt: 1,
          },
        },
        {
          new: true,
        },
      );

      if (!order) {
        channel.ack(msg);
        return;
      }

      console.log("✅ Payment successful! Order Placed:", order._id);

      //socket work
      //TODO: emit event to restaurant service to notify about new order
      await axios.post(
        `${process.env.REALTIME_URL}/api/v1/internal/emit`,
        {
          event: "order:new",
          room: `restaurant:${order.restaurantId}`,
          payload: order,
        },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
          },
        },
      );

      channel.ack(msg);
    } catch (error) {
      channel.nack(msg, false, false); // ❗ discard message
      console.error(
        "🐇 Error occurred while consuming payment messages:\n",
        error,
      );
    }
  });
};
