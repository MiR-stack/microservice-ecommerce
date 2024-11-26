import amqp from "amqplib";
import { QUEUE_URL } from "./config";

const recieveQueue = async (
  queue: string,
  cb: (message: string) => Promise<boolean> | boolean
) => {
  try {
    const connection = await amqp.connect(QUEUE_URL);
    const channel = await connection.createChannel();

    const exchange = "order";
    await channel.assertExchange(exchange, "direct");

    const q = await channel.assertQueue(queue);
    await channel.bindQueue(q.queue, exchange, queue);

    console.log(`Waiting for messages in queue: ${queue}`);

    channel.consume(q.queue, async (msg) => {
      if (msg) {
        try {
          const messageContent = msg.content.toString();
          const isAcknowledge = await cb(messageContent);

          if (isAcknowledge) {
            channel.ack(msg);
            console.log(`Message acknowledged: ${queue}`);
          } else {
            channel.nack(msg);
            console.log(`Message not acknowledged: ${queue}`);
          }
        } catch (error) {
          console.error(`Error processing message: ${error}`);
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error(`Failed to connect to RabbitMQ: ${error}`);
  }
};

export default recieveQueue;
