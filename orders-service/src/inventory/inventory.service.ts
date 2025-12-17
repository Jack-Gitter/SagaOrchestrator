import { UUID } from "crypto";
import { Inbox } from "../db/entities/inbox.entity";
import { Snapshot } from "../db/entities/snapshot.entity";
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from "../db/types";
import { DataSource } from "typeorm";
import { Snapshot as SagaSnapshot } from "xstate";
import { Outbox } from "src/db/entities/outbox.entity";

export class InventoryService {

	constructor(private datasource: DataSource) {}

	async handleInventoryResponse(orderId: UUID, productId: number, quantity: number, message: any, messageId: any, snapshot: SagaSnapshot<unknown>) {
		await this.datasource.transaction(async (transaction) => {
			const outboxRepository = this.datasource.getRepository(Outbox)
			const snapshotRepository = this.datasource.getRepository(Snapshot)
			const inboxRepository = transaction.getRepository(Inbox)

			const outboxMessage = new Outbox(orderId, quantity, productId, OUTBOX_MESSAGE_TYPE.RESERVE_INVENTORY)
			const inboxMessage = new Inbox(orderId, INBOX_MESSAGE_TYPE.INVENTORY_REMOVE_RESPONSE, true);
			const snapshotEntity = new Snapshot(orderId, snapshot)

			await inboxRepository.save(inboxMessage)
			await snapshotRepository.save(snapshotEntity)
			await outboxRepository.save(outboxMessage)
		})
	}
}
