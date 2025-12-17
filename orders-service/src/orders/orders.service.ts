import { UUID } from "node:crypto";
import { ReserveInventoryOutboxMessage } from "../db/entities/reserve-inventory-outbox-message.entity";
import { DataSource } from "typeorm";
import { Order } from "../db/entities/order.entity";
import { Snapshot as StateMachineSnapshot} from "xstate";
import { Snapshot } from "../db/entities/snapshot.entity";


export class OrdersService {

	constructor(private datasource: DataSource) {}

	async handleOrderRequest(orderId: UUID, productId: number, quantity: number, snapshot: StateMachineSnapshot<unknown>) {
		await this.datasource.transaction(async (transaction) => {
			const snapshotRepository = this.datasource.getRepository(Snapshot)
			const orderRepository = transaction.getRepository(Order)
			const inventoryReserveRepository = transaction.getRepository(ReserveInventoryOutboxMessage)

			const order = new Order(orderId, quantity, productId)
			const inventoryReserveMessage = new ReserveInventoryOutboxMessage(orderId, quantity, productId)
			const snapshotEntity = new Snapshot(orderId, snapshot)

			await orderRepository.save(order)
			await inventoryReserveRepository.save(inventoryReserveMessage)
			await snapshotRepository.save(snapshotEntity)
		})
	}
}
