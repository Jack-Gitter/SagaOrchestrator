import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";
import { STEP } from "../../../db/entities/types";
import { InboxMessage } from "../../../db/entities/inbox.entity";
import { OutboxMessage } from "../../../db/entities/outbox.entity";
import { OrderSagaEntity } from "../../../db/entities/saga.entity";
import { OrderSagaStepData } from "./types";
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from "../../../db/types";

export class ShipOrderStep implements SagaStepInterface<OrderSagaStepData, OrderSagaStepData> {

	public step: STEP = STEP.SHIP_ORDER

	constructor(private datasource: DataSource) {}

    async invoke(data: OrderSagaStepData): Promise<void> {
		console.log(`shipping order for order with id ${data.orderId}`)
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)
			const existingMessage = await inboxRepository.findOneBy({id: data.messageId, messageType: INBOX_MESSAGE_TYPE.INVENTORY_RESPONSE})
			if (existingMessage) {
				console.log(`already shipped order for order with id ${data.orderId}, skipping`)
				return
			}
			const outboxRepository = manager.getRepository(OutboxMessage)
			const sagaRepository = manager.getRepository(OrderSagaEntity)

			const inboxMessage = new InboxMessage(data.messageId, data.orderId, INBOX_MESSAGE_TYPE.INVENTORY_RESPONSE, true)
			const outboxMessage = new OutboxMessage(data.orderId, data.productId, data.quantity, OUTBOX_MESSAGE_TYPE.SHIP_ORDER)
			const sagaEntity = new OrderSagaEntity(data.orderId, data.productId, data.quantity, STEP.SHIP_ORDER)

			await inboxRepository.save(inboxMessage)
			await outboxRepository.save(outboxMessage)
			await sagaRepository.save(sagaEntity)
		})
    }
    async compenstate(data: OrderSagaStepData): Promise<void> {
		console.log(`compensating ship order step`)
		await this.datasource.transaction(async manager => {
			const outboxRepository = manager.getRepository(OutboxMessage)

			const outboxMessage = new OutboxMessage(data.orderId, data.productId, data.quantity, OUTBOX_MESSAGE_TYPE.SHIP_ORDER_CANCEL)

			await outboxRepository.save(outboxMessage)
		})
    }
}
