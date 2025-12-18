import * as amqplib from 'amqplib'
import { OutboxMessage } from '../db/entities/outbox.entity';
import { OUTBOX_MESSAGE_TYPE } from '../db/types';
import { DataSource } from 'typeorm';
import { InventoryResponseMessage, QUEUE, ShippingResponseMessage } from './types';
import { OrdersSagaOrchestrator } from '../orders/orchestrator/orders.orchestrator';
import { InboxMessage } from '../db/entities/inbox.entity';

export class RabbitMQService {

	private channel: amqplib.Channel
	constructor(private datasource: DataSource, private orderSagaOrchestrator: OrdersSagaOrchestrator) {}

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

	  await this.listenForRemoveInventoryResponse()
	  await this.listenForShippingResponse()
	}

	sendMessage = (queue: string, message: Buffer) => {
		this.channel.sendToQueue(queue, message)
	}

	listenForRemoveInventoryResponse = async () => {
		await this.channel.consume(QUEUE.REMOVE_INVENTORY_RESPONSE, async (msg) => {
			if (msg !== null) {
					const message: InventoryResponseMessage = JSON.parse(msg.content.toString())
					console.log(`Received message with orderId ${message.orderId} and status ${message.successful}`);
					await this.orderSagaOrchestrator.handleInventoryResponseMessage(message.orderId, message.successful, message.id)
					this.channel.ack(msg)
			}
		})
	}

	listenForShippingResponse = async () => {
		await this.channel.consume(QUEUE.SHIP_ORDER_RESPONSE, async (msg) => {
			if (msg !== null) {
					const message: ShippingResponseMessage = JSON.parse(msg.content.toString())
					console.log(`Received message with orderId ${message.orderId} and status ${message.successful}`);
					await this.orderSagaOrchestrator.handleShippingResponseMessage(message.orderId, message.successful, message.id)
					this.channel.ack(msg)
			}
		})
	}
	
	pollOutbox = () => {
		const outboxRepository = this.datasource.getRepository(OutboxMessage)
		setInterval(async () => {
			const outboxMessages = await outboxRepository.find()
			for (const outboxMessage of outboxMessages) {
				const json = outboxMessage.toJson();
				const buffer = Buffer.from(JSON.stringify(json))
				switch (outboxMessage.messageType) {
					case OUTBOX_MESSAGE_TYPE.REMOVE_INVENTORY: 
						console.log(`sending remove inventory message for order with id ${outboxMessage.orderId}`)
						this.channel.sendToQueue(QUEUE.REMOVE_INVENTORY, buffer)
						break;
					default: 
						console.log(`sending ship order message for order with id ${outboxMessage.orderId}`)
						this.channel.sendToQueue(QUEUE.SHIP_ORDER, buffer)
				}
				await outboxRepository.remove(outboxMessage)
			}
		}, 5000)
	}

}
