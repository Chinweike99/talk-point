import amqp from 'amqplib'

let connection: amqp.Connection;
let channel: amqp.Channel;

export const connectRabbitMQ = async() =>{
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL!)
    } catch (error) {
        
    }
}