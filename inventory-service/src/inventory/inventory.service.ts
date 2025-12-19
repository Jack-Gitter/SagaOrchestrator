import { InboxMessage } from "db/entities/inbox.entity";
import { OutboxMessage } from "db/entities/outbox.entity";
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from "db/types";
import { UUID } from "node:crypto";
import { DataSource } from "typeorm";

export class InventoryService {

	constructor(private datasource: DataSource) {}

	// Mock work
	async removeInventory(messageId: UUID, orderId: UUID, productId: number, quantity: number) {
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)
			const outboxRepository = manager.getRepository(OutboxMessage)

			const inboxMessage = new InboxMessage(messageId, orderId, INBOX_MESSAGE_TYPE.REMOVE_INVENTORY)
			const outboxMessage = new OutboxMessage(orderId, true, OUTBOX_MESSAGE_TYPE.INVENTORY_RESPONSE)

			await inboxRepository.save(inboxMessage)
			await outboxRepository.save(outboxMessage)

		})
	}
	

	// Mock work
	async restoreInventory(messageId: UUID, orderId: UUID, productId: number, quantity: number) {
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)

			const inboxMessage = new InboxMessage(messageId, orderId, INBOX_MESSAGE_TYPE.RESTORE_INVENTORY)

			await inboxRepository.save(inboxMessage)

		})
	}
}
