import { UUID } from "node:crypto";
import { Order } from "../db/entities/order.entity";
import { OutboxMessage } from "../db/entities/outbox.entity";
import { Snapshot } from "../db/entities/snapshot.entity";
import { INBOX_MESSAGE_TYPE, ORDER_STATUS, OUTBOX_MESSAGE_TYPE, STATE } from "../db/types";
import { DataSource } from "typeorm";
import { Snapshot as SagaSnapshot} from "xstate";
import { InboxMessage } from "../db/entities/inbox.entity";

export class OrdersService {


	constructor(private datasource: DataSource) {}

	createOrder = async (orderId: UUID, productId: number, quantity: number, snapshot: SagaSnapshot<unknown>) => {
		console.log(`creating order with id ${orderId}`)
		await this.datasource.transaction(async manager => {
			const orderRepository = manager.getRepository(Order)
			const existingOrder = await orderRepository.findOneBy({orderId})
			if (existingOrder) {
				console.log(`already created order with id ${orderId}, skipping`)
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

	finalizeOrder = async (messageId: UUID, orderId: UUID) => {
		console.log(`finalizing order with id ${orderId}`)
		await this.datasource.transaction(async manager => {

			const inboxRepository = this.datasource.getRepository(InboxMessage)
			const orderRepository = manager.getRepository(Order)
			const message = await inboxRepository.findOneBy({id: messageId})
			if (message) {
			console.log(`already finalized order with id ${orderId}`)
				return;
			}

			const inboxMessage = new InboxMessage(messageId, orderId, INBOX_MESSAGE_TYPE.SHIPPING_RESPONSE, true)
			const existingOrder = await orderRepository.findOneBy({orderId})

			existingOrder.status = ORDER_STATUS.FULFILLED

			await inboxRepository.save(inboxMessage)
			await orderRepository.save(existingOrder)


		})
	}

}
