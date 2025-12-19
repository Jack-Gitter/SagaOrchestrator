import { UUID } from "node:crypto";
import { InboxMessage } from "../db/entities/inbox.entity";
import { OutboxMessage } from "../db/entities/outbox.entity";
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from "../db/entities/types";
import { DataSource } from "typeorm";

export class ShippingService {

	constructor(private datasource: DataSource) {}

	async shipOrder(messageId: UUID, orderId: UUID, productId: number, quantity: number) {
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)
			const outboxRepository = manager.getRepository(OutboxMessage)

			const existingMessage = await inboxRepository.findOneBy({id: messageId, messageType: INBOX_MESSAGE_TYPE.SHIP_ORDER})
			if (existingMessage) {
				console.log(`already processed message with id ${messageId} for order ${orderId} of type ${INBOX_MESSAGE_TYPE.SHIP_ORDER}`)
				return
			}

			/* 10% of the time fail, to test compensation. In a real scenario, 
			 this function would throw an error, and we would catch and persist the error message to the outbox */
			let success = true
			if(Math.random() < 0.1) {
				console.log(`failed to ship order`)
				success = false
			}
			const inboxMessage = new InboxMessage(messageId, orderId, productId, quantity, INBOX_MESSAGE_TYPE.SHIP_ORDER)
			const outboxMessage = new OutboxMessage(orderId, success, OUTBOX_MESSAGE_TYPE.SHIPPING_RESPONSE)

			await inboxRepository.save(inboxMessage)
			await outboxRepository.save(outboxMessage)
		})

	}

	async cancelShipment(messageId: UUID, orderId: UUID, productId: number, quantity: number) {
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)

			const existingMessage = await inboxRepository.findOneBy({id: messageId, messageType: INBOX_MESSAGE_TYPE.SHIP_ORDER_CANCEL})
			if (existingMessage) {
				console.log(`already processed message with id ${messageId} for order ${orderId} of type ${INBOX_MESSAGE_TYPE.SHIP_ORDER_CANCEL}`)
				return
			}

			const inboxMessage = new InboxMessage(messageId, orderId, productId, quantity, INBOX_MESSAGE_TYPE.SHIP_ORDER_CANCEL)

			await inboxRepository.save(inboxMessage)
		})

	}

}
