import { UUID } from "crypto";
import { InboxMessage } from "src/db/entities/inbox.entity";
import { Snapshot } from "src/db/entities/snapshot.entity";
import { MESSAGE_TYPE } from "src/db/types";
import { DataSource } from "typeorm";
import { Snapshot as SagaSnapshot } from "xstate";

export class InventoryService {

	constructor(private datasource: DataSource) {}


	async handleInventoryResponse(orderId: UUID, productId: number, quantity: number, message: any, messageId: any, snapshot: SagaSnapshot<unknown>) {
		await this.datasource.transaction(async (transaction) => {
			const snapshotRepository = this.datasource.getRepository(Snapshot)
			const inboxRepository = transaction.getRepository(InboxMessage)

			const inboxMessage = new InboxMessage(orderId, MESSAGE_TYPE.INVENTORY_REMOVE_RESPONSE, true);
			const snapshotEntity = new Snapshot(orderId, snapshot)

			await inboxRepository.save(inboxMessage)
			await snapshotRepository.save(snapshotEntity)
		})
	}
}
