import { getChannel } from "./rabbitmq.config.js";
export const publishOrderCreated = async (type, data) => {
    const channel = getChannel();
    if (!channel) {
        console.error("RabbitMQ channel is not available");
        return;
    }
    channel.sendToQueue(process.env.ORDER_READY_QUEUE, Buffer.from(JSON.stringify({ type, data })), { persistent: true });
};
