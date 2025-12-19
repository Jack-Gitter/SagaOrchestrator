import * as amqplib from 'amqplib'
import { DataSource } from 'typeorm';
import { OutboxMessage } from '../db/entities/outbox.entity';
import { ShippingService } from '../shipping/shipping.service';
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from '../db/entities/types';
import { Message } from './types';

export class RabbitMQService {
	private channel: amqplib.Channel

	constructor(private datasource: DataSource, private shippingService: ShippingService) {
		console.log('inventory service is listening for messages')
	}

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
		await this.handleShipOrderMessage()
		this.pollOutbox()
	}

	handleShipOrderMessage = async () => {
		await this.channel.consume(INBOX_MESSAGE_TYPE.SHIP_ORDER, async (msg) => {
			if (msg !== null) {
				const message: Message = JSON.parse(msg.content.toString())
				console.log(`Received message with orderId ${message.orderId} and status ${message.success} on queue ${INBOX_MESSAGE_TYPE.SHIP_ORDER}`);
				await this.shippingService.shipOrder(message.id, message.orderId, message.productId, message.quantity)
				this.channel.ack(msg)
			}
		})
	}
	handleRestoreInventory = async () => {
		await this.channel.consume(INBOX_MESSAGE_TYPE.SHIP_ORDER_CANCEL, async (msg) => {
			if (msg !== null) {
				const message: Message = JSON.parse(msg.content.toString())
				console.log(`Received message with orderId ${message.orderId} and status ${message.success} on queue ${INBOX_MESSAGE_TYPE.SHIP_ORDER_CANCEL}`);
				await this.shippingService.cancelShipment(message.id, message.orderId, message.productId, message.quantity)
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



