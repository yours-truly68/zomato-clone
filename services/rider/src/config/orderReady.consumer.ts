import axios from "axios";
import { getChannel } from "./rabbitmq.config.js";
import Rider from "../models/Rider.model.js";

export const startOrderReadyConsumer = async () => {
  const channel = getChannel();
  if (!channel) {
    console.error("🐇 RabbitMQ channel is not available");
    return;
  }

  console.log(
    "🚀 Starting Order Ready Consumer...",
    process.env.ORDER_READY_QUEUE,
  );

  channel.consume(process.env.ORDER_READY_QUEUE!, async (msg) => {
    if (!msg) return;

    try {
      const message = msg.content.toString();
      console.log("📩 Received Order Ready Message:", message);
      const event = JSON.parse(message);
      console.log("📦 Parsed Event:", event.type);
      if (event.type !== "ORDER_READY_FOR_PICKUP") {
        channel.ack(msg);
        return;
      }

      //TODO: Find nearby available riders and assign the order
      const { orderId, restaurantId, location } = event.data;

      //Find nearby riders
      const nearbyRiders = await Rider.find({
        isAvailable: true,
        isVerified: true,
        location: {
          $near: {
            $geometry: location,
            $maxDistance: 5000, // 5 km radius
          },
        },
      });

      console.log(
        `🔍 Found ${nearbyRiders.length} nearby riders for order ${orderId}`,
      );

      if (nearbyRiders.length === 0) {
        console.warn(`⚠️ No available riders found for order ${orderId}`);
        channel.ack(msg);
        return;
      }

      for (const rider of nearbyRiders) {
        console.log(
          `📲 Notifying rider ${rider.userId} about order ${orderId}...`,
        );
        try {
          await axios.post(
            `${process.env.REALTIME_URL}/api/v1/internal/emit`,
            {
              event: "order:available",
              room: `user:${rider.userId}`,
              payload: {
                orderId,
                restaurantId,
              },
            },
            {
              headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
              },
            },
          );

          console.log(
            `✅ Notification sent to rider ${rider.userId} for order ${orderId}`,
          );
        } catch (error) {
          console.error(
            `❌ Failed to notify rider ${rider.userId} for order ${orderId}:`,
            error,
          );
        }
      }

      {
        //Alternatively, we can use Promise.allSettled to send notifications which is much faster and also gives us the result for each notification attempt to log success or failure for each rider notification without affecting others.
        //   const results = await Promise.allSettled(
        //     nearbyRiders.map((rider) => {
        //       return axios.post(
        //         `${process.env.REALTIME_URL}/api/v1/internal/emit`,
        //         {
        //           event: "order:available",
        //           room: `user:${rider.userId}`,
        //           payload: {
        //             orderId,
        //             restaurantId,
        //           },
        //         },
        //         {
        //           headers: {
        //             "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
        //           },
        //         },
        //       );
        //     }),
        //   );
        //   results.forEach((result, index) => {
        //     const rider = nearbyRiders[index];
        //     if (result.status === "fulfilled") {
        //       console.log(`✅ Notification sent to rider ${rider?._id}`);
        //     } else {
        //       console.error(
        //         `❌ Failed to notify rider ${rider?._id}:`,
        //         result.reason,
        //       );
        //     }
        //   });
      }

      {
        /* Note: If the number of nearby riders is very large, sending notifications to all of them at once might not be ideal. In such cases, we can implement a batching mechanism to send notifications in smaller groups to avoid overwhelming the notification service and to better manage system resources. For example, we can send notifications to 20 riders at a time with a short delay between batches. This way, we can ensure that all nearby riders are notified without causing performance issues. The batching logic can be implemented using a simple loop with a delay (e.g., using setTimeout) or by using libraries like p-limit to control concurrency. */
        // const batch = 20;
        // for (let i = 0; i < nearbyRiders.length; i += batch) {
        //   const batchRiders = nearbyRiders.slice(i, i + batch);
        //   await Promise.allSettled(
        //     batchRiders.map((rider) => {
        //       return axios.post(
        //         `${process.env.REALTIME_URL}/api/v1/internal/emit`,
        //         {
        //           event: "order:available",
        //           room: `user:${rider.userId}`,
        //           payload: {
        //             orderId,
        //             restaurantId,
        //           },
        //         },
        //         {
        //           headers: {
        //             "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
        //           },
        //         },
        //       );
        //     }),
        //   );
        // }
      }

      channel.ack(msg);
    } catch (error) {
      channel.nack(msg, false, false); // ❗ discard message, dead lettering can be implemented for later analysis
      console.error(
        "🐇 Error occurred while consuming order ready messages:\n",
        error,
      );
    }
  });
};
