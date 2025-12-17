import { UUID } from "node:crypto";
import { InboxMessage } from "../db/entities/inbox.entity";
import { OutboxMessage } from "../db/entities/outbox.entity";
import { Snapshot } from "../db/entities/snapshot.entity";
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE, STATE } from "../db/types";
import { DataSource } from "typeorm";
import { Snapshot as SagaSnapshot } from "xstate";

export class InventoryService {

	constructor(private datasource: DataSource) {}

	handleInventoryMessage = async (orderId: UUID, productId: number, quantity: number, successful: boolean, sagaSnapshot: SagaSnapshot<unknown>) => {
		console.log('handling inventory message')
		const snapshotRepository = this.datasource.getRepository(Snapshot)
		const snap = await snapshotRepository.findOneBy({orderId})
		if (snap?.state === STATE.HANDLE_INVENTORY_RESPONSE) {
			console.log('already handled, skipping')
			return;
		}
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)
			const outboxRepository = manager.getRepository(OutboxMessage)
			const snapshotRepository = manager.getRepository(Snapshot)

			const inboxMessage = new InboxMessage(orderId, INBOX_MESSAGE_TYPE.INVENTORY_REMOVE_RESPONSE, successful)
			const outboxMessage = new OutboxMessage(orderId, productId, quantity, OUTBOX_MESSAGE_TYPE.SHIP_PRODUCT)
			const snapshot = new Snapshot(orderId, STATE.HANDLE_INVENTORY_RESPONSE, sagaSnapshot)

			await inboxRepository.save(inboxMessage)
			await outboxRepository.save(outboxMessage)
			await snapshotRepository.save(snapshot)
		})

	}

}
