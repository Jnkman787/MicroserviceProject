import amqp from 'amqplib';
import logger from './logger';

// function to establish a connection to RabbitMQ
const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost'); // adjust the URL as needed
        const channel = await connection.createChannel();
        return channel;
    } catch (error) {
        logger.error(`Error connecting to RabbitMQ: ${error}`);
        throw error;
    }
};

// function to publish messages to a specified queue
const publishMessage = async (channel: amqp.Channel, queue: string, message: string) => {
    try {
        await channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(message));
    } catch (error) {
        logger.error(`Error publishing message: ${error}`);
        throw error;
    }
};

// function to subscribe to a specified queue and handle messages using a callback
const subscribeToQueue = async (channel: amqp.Channel, queue: string, callback: (msg: string) => void) => {
    try {
        await channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            if (message !== null) {
                callback(message.content.toString());
                channel.ack(message);
            }
        });
    } catch (error) {
        logger.error(`Error subscribing to queue: ${error}`);
        throw error;
    }
};

export default connectRabbitMQ;
export { publishMessage, subscribeToQueue };