import { UUID } from "node:crypto";
import { InboxMessage } from "src/db/entities/inbox.entity";
import { ReserveInventoryOutboxMessage } from "src/db/entities/reserve-inventory-outbox-message.entity";
import { Snapshot } from "src/db/entities/snapshot.entity";
import { Order } from "src/db/order.entity";
import { MESSAGE_TYPE } from "src/db/types";
import { DataSource } from "typeorm";
import { Snapshot as SagaSnapshot} from "xstate";


export class OrdersService {

	constructor(private datasource: DataSource) {}

	async receiveOrder(orderId: UUID, productId: number, quantity: number, snapshot: SagaSnapshot<unknown>) {
		const inboxRepository = this.datasource.getRepository(InboxMessage)
		if (await inboxRepository.findOneBy({orderId})) {
			return;
		}
		await this.datasource.transaction(async (transaction) => {
			const inboxRepository = transaction.getRepository(InboxMessage)
			const orderRepository = transaction.getRepository(Order)
			const inventoryReserveRepository = transaction.getRepository(ReserveInventoryOutboxMessage)
			const snapshotRepository = transaction.getRepository(Snapshot)

			const order = new Order(orderId, quantity, productId)
			const inventoryReserveMessage = new ReserveInventoryOutboxMessage(orderId, quantity, productId)
			const inboxMessage = new InboxMessage(orderId, MESSAGE_TYPE.RECEIVE_ORDER);
			const snapshotEntity = new Snapshot(orderId, snapshot)

			await orderRepository.save(order)
			await inventoryReserveRepository.save(inventoryReserveMessage)
			await snapshotRepository.save(snapshotEntity)
			await inboxRepository.save(inboxMessage)
		})
	}
}
