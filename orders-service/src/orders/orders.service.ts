import { UUID } from "node:crypto";
import { Order } from "../db/entities/order.entity";
import { OutboxMessage } from "../db/entities/outbox.entity";
import { Snapshot } from "../db/entities/snapshot.entity";
import { OUTBOX_MESSAGE_TYPE, STATE } from "../db/types";
import { DataSource } from "typeorm";
import { Snapshot as SagaSnapshot} from "xstate";

export class OrdersService {


	constructor(private datasource: DataSource) {}

	createOrder = async (orderId: UUID, productId: number, quantity: number, snapshot: SagaSnapshot<unknown>) => {
		console.log('creating order')
		await this.datasource.transaction(async manager => {
			const orderRepository = manager.getRepository(Order)
			const existingOrder = await orderRepository.findOneBy({orderId})
			if (existingOrder) {
				console.log('already created order, skipping')
				return;
			}
			const outboxRepository = manager.getRepository(OutboxMessage)
			const snapshotRepository = manager.getRepository(Snapshot)

			const order = new Order(orderId, productId, quantity)
			const outboxMessage = new OutboxMessage(orderId, productId, quantity, OUTBOX_MESSAGE_TYPE.REMOVE_INVENTORY)
			const sagaSnapshot = new Snapshot(orderId, STATE.CREATE_ORDER, snapshot)

			await orderRepository.save(order)
			await outboxRepository.save(outboxMessage)
			await snapshotRepository.save(sagaSnapshot)
		})
	}
}
