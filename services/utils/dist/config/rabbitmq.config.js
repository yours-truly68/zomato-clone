import amqlib from "amqplib";
let channel;
export const connectToRabbitMQ = async () => {
    try {
        const connection = await amqlib.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(process.env.PAYMENT_QUEUE, { durable: true });
        console.log("🐇 Connected to RabbitMQ");
    }
    catch (error) {
        console.error("🐇 Error connecting to RabbitMQ:\n", error);
    }
};
export const getChannel = () => channel;
