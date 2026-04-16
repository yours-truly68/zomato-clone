import amqlib from "amqplib";
let channel;
export const connectToRabbitMQ = async () => {
    try {
        const connection = await amqlib.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(process.env.RIDER_QUEUE, { durable: true });
        await channel.assertQueue(process.env.ORDER_READY_QUEUE, {
            durable: true,
        });
        console.log("🐇 Connected to RabbitMQ: Rider Service");
    }
    catch (error) {
        console.error("🐇 Error connecting to RabbitMQ(rider service):\n", error);
    }
};
export const getChannel = () => channel;
