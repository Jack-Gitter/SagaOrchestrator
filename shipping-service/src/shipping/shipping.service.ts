import { UUID } from "node:crypto";
import { InboxMessage } from "src/db/entities/inbox.entity";
import { OutboxMessage } from "src/db/entities/outbox.entity";
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from "src/db/entities/types";
import { DataSource } from "typeorm";

export class ShippingService {

	constructor(private datasource: DataSource) {}

	async shipOrder(messageId: UUID, orderId: UUID, productId: number, quantity: number) {
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)
			const outboxRepository = manager.getRepository(OutboxMessage)

			/* 10% of the time fail, to test compensation. In a real scenario, 
			 this function would throw an error, and we would catch and persist the error message to the outbox */
			let success = true
			if(Math.random() < 0.1) {
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

			const inboxMessage = new InboxMessage(messageId, orderId, productId, quantity, INBOX_MESSAGE_TYPE.SHIP_ORDER_CANCEL)

			await inboxRepository.save(inboxMessage)
		})

	}

}
