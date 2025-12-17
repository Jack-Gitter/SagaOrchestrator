import * as amqplib from 'amqplib'

export class RabbitMQService {

	constructor(private queue: string) {}

	async init() {
	  const connection = await amqplib.connect('amqp://localhost');
	  const channel = await connection.createChannel();
	  await channel.assertQueue(this.queue);
	}
}
