import * as amqplib from 'amqplib'
import { DataSource } from 'typeorm';
import { INBOX_MESSAGE_TYPE } from './types';

export class RabbitMQService {
	private channel: amqplib.Channel

	constructor(private datasource: DataSource) {
	}

	async init() {
	  const connection = await amqplib.connect({
		  username: process.env.RABBITMQ_USER,
		  password: process.env.RABBITMQ_PASSWORD
	  });
	  const channel = await connection.createChannel();
	  this.channel = channel;

	  for (const queue of Object.values(INBOX_MESSAGE_TYPE)) {
		await channel.assertQueue(queue)
		this.listenForMessage(queue)
	  }
		this.pollOutbox()
	}

	listenForMessage = async (queue: INBOX_MESSAGE_TYPE | OUTBOX_MESSAGE_TYPE) => {
		await this.channel.consume(queue, async (msg) => {
			if (msg !== null) {
				const message: ResponseMessage = JSON.parse(msg.content.toString())
				console.log(`Received message with orderId ${message.orderId} and status ${message.success}`);
				if (message.success) {
					await this.orderSagaOrchestrator.invokeNext(message.orderId, message.id)
				} else {
					await this.orderSagaOrchestrator.compensateSaga(message.orderId)
				}
				this.channel.ack(msg)
			}
		})
	}

	pollOutbox = () => {
		const outboxRepository = this.datasource.getRepository(OutboxMessage)
		setInterval(async () => {
			const outboxMessages = await outboxRepository.find()
			outboxMessages.forEach(async outboxMessage => {
				const json = outboxMessage.toJson();
				const buffer = Buffer.from(JSON.stringify(json))
				console.log(`sending outbox message to ${outboxMessage.messageType} queue`)
				this.channel.sendToQueue(outboxMessage.messageType, buffer)
				await outboxRepository.remove(outboxMessage)
			})
		}, 5000)
	}
}



