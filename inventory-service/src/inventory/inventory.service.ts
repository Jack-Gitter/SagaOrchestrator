import { InboxMessage } from "../db/entities/inbox.entity";
import { OutboxMessage } from "../db/entities/outbox.entity";
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from "../db/types";
import { UUID } from "node:crypto";
import { DataSource } from "typeorm";

export class InventoryService {

	constructor(private datasource: DataSource) {}

	// Mock work
	async removeInventory(messageId: UUID, orderId: UUID, productId: number, quantity: number) {
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)
			const outboxRepository = manager.getRepository(OutboxMessage)

			/* 10% of the time fail, to test compensation. In a real scenario, 
			 this function would throw an error, and we would catch and persist the error message to the outbox */
			let success = true
			if(Math.random() < 0.1) {
				success = false
			}
			const inboxMessage = new InboxMessage(messageId, orderId, productId, quantity, INBOX_MESSAGE_TYPE.REMOVE_INVENTORY)
			const outboxMessage = new OutboxMessage(orderId, success, OUTBOX_MESSAGE_TYPE.INVENTORY_RESPONSE)

			await inboxRepository.save(inboxMessage)
			await outboxRepository.save(outboxMessage)

		})
	}
	

	// Mock work
	async restoreInventory(messageId: UUID, orderId: UUID, productId: number, quantity: number) {
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)

			const inboxMessage = new InboxMessage(messageId, orderId, productId, quantity, INBOX_MESSAGE_TYPE.RESTORE_INVENTORY)

			await inboxRepository.save(inboxMessage)

		})
	}
}
