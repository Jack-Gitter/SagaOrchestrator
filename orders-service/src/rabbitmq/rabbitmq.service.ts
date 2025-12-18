import * as amqplib from 'amqplib'
import { DataSource } from 'typeorm';
import { OutboxMessage } from 'src/db/entities/outbox.entity';
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from 'src/db/types';

export class RabbitMQService {

	private channel: amqplib.Channel

	constructor(private datasource: DataSource) {}

	async init() {
	  const connection = await amqplib.connect({
		  username: process.env.RABBITMQ_USER,
		  password: process.env.RABBITMQ_PASSWORD
	  });
	  const channel = await connection.createChannel();
	  this.channel = channel;

	  for (const queue of Object.values(OUTBOX_MESSAGE_TYPE)) {
		await channel.assertQueue(queue)
	  }
	  for (const queue of Object.values(INBOX_MESSAGE_TYPE)) {
		await channel.assertQueue(queue)
	  }
	}


	sendMessage = (queue: string, message: Buffer) => {
		this.channel.sendToQueue(queue, message)
	}


	pollOutbox = () => {
		const outboxRepository = this.datasource.getRepository(OutboxMessage)
		setInterval(async () => {
			const outboxMessages = await outboxRepository.find()
			outboxMessages.forEach(async message => {
				const json = message.toJson();
				const buffer = Buffer.from(JSON.stringify(json))
				console.log(`sending outbox message to ${message.messageType} queue`)
				this.channel.sendToQueue(message.messageType, buffer)
			})
		}, 5000)
	}

}
