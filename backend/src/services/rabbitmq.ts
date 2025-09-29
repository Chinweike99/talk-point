import amqp from 'amqplib'
import { Message } from '../types';

let connection: amqp.Connection;
let channel: amqp.Channel | any;

export const connectRabbitMQ = async() =>{
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL!);
        const channel = await connection.createChannel();

        // Assert queues
        await channel.assertQueue('message_queue', { durable: true });
        await channel.assertQueue('notification_queue', { durable: true })
        console.log('Connected to RabbitMQ');

    } catch (error) {
        console.error("RabbitMQ connection error", error);
        process.exit(1)
    }
};

export const sendToQueue = async(queue: string, message: any) => {
    try {
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        })
    } catch (error) {
        console.error("Error sending to queue:", error)
    }
}


export const consumeFromQueue = async(queue: string, cb: (message: any)=>void) =>{
    try {
        channel.consume(queue, (msg: Message) => {
            if(msg !== null){
                const content = JSON.parse(msg.content.toString());
                cb(content);
                channel.ack(msg);
            }
        })
    } catch (error) {
        console.error('Error consuming from queue:', error);
    }
};

export const getChannel = () => channel
