import amqp from "amqplib";

const sendToQueue = async (queue: string, message: string) => {
  try {
    const connection = await amqp.connect(
      process.env.AMQP_URL || "amqp://localhost"
    );
    const channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");

    const exchange = "order";
    await channel!.assertExchange(exchange, "direct");

    channel!.publish(exchange, queue, Buffer.from(message));
    console.log(`Message sent to queue ${queue}`);

    // Optionally close the channel after a timeout
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error(`Failed to send message to queue: ${error}`);
  }
};

export default sendToQueue;
