import * as amqplib from 'amqplib'
import { OutboxMessage } from '../db/entities/outbox.entity';
import { OUTBOX_MESSAGE_TYPE } from '../db/types';
import { DataSource } from 'typeorm';
import { QUEUE } from './types';

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

	  for (const queue of Object.values(QUEUE)) {
		await channel.assertQueue(queue)
	  }
	}

	sendMessage(queue: string, message: Buffer) {
		this.channel.sendToQueue(queue, message)
	}

	pollOutbox() {
		const outboxRepository = this.datasource.getRepository(OutboxMessage)
		setInterval(async () => {
			console.log('looking for messages')
			const outboxMessages = await outboxRepository.find()
			for (const outboxMessage of outboxMessages) {
				switch (outboxMessage.messageType) {
					case OUTBOX_MESSAGE_TYPE.REMOVE_INVENTORY: 
						console.log('sending remove inventory message')
						const json = outboxMessage.toJson();
						const buffer = Buffer.from(JSON.stringify(json))
						this.channel.sendToQueue(QUEUE.REMOVE_INVENTORY, buffer)
						await outboxRepository.remove(outboxMessage)
						break;
					default: 
						throw new Error('not supported yet')
				}
			}
		}, 5000)
	}

}
