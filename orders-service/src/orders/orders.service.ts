import { UUID } from "node:crypto";
import { Outbox } from "../db/entities/outbox.entity";
import { DataSource } from "typeorm";
import { Order } from "../db/entities/order.entity";
import { Snapshot as StateMachineSnapshot} from "xstate";
import { Snapshot } from "../db/entities/snapshot.entity";
import { OUTBOX_MESSAGE_TYPE } from "src/db/types";


export class OrdersService {

	constructor(private datasource: DataSource) {}

	async handleOrderRequest(orderId: UUID, productId: number, quantity: number, snapshot: StateMachineSnapshot<unknown>) {
		await this.datasource.transaction(async (transaction) => {
			const snapshotRepository = this.datasource.getRepository(Snapshot)
			const orderRepository = transaction.getRepository(Order)
			const inventoryReserveRepository = transaction.getRepository(Outbox)

			const order = new Order(orderId, quantity, productId)
			const inventoryReserveMessage = new Outbox(orderId, quantity, productId, OUTBOX_MESSAGE_TYPE.RESERVE_INVENTORY)
			const snapshotEntity = new Snapshot(orderId, snapshot)

			await orderRepository.save(order)
			await inventoryReserveRepository.save(inventoryReserveMessage)
			await snapshotRepository.save(snapshotEntity)
		})
	}
}
