import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";
import { STEP } from "../../../db/entities/types";
import { OrderSagaStepData } from "./types";
import { InboxMessage } from "src/db/entities/inbox.entity";
import { OutboxMessage } from "src/db/entities/outbox.entity";
import { OrderSagaEntity } from "src/db/entities/saga.entity";
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from "src/db/types";

export class RemoveInventoryStep implements SagaStepInterface<OrderSagaStepData, OrderSagaStepData> {

	public step: STEP = STEP.REMOVE_INVENTORY

	constructor(private datasource: DataSource) {}

    async invoke(data: OrderSagaStepData): Promise<void> {
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)
			const outboxRepository = manager.getRepository(OutboxMessage)
			const sagaRepository = manager.getRepository(OrderSagaEntity)

			const inboxMessage = new InboxMessage(data.messageId, data.orderId, INBOX_MESSAGE_TYPE.INVENTORY_RESPONSE, true)
			const outboxMessage = new OutboxMessage(data.orderId, data.productId, data.quantity, OUTBOX_MESSAGE_TYPE.SHIP_PRODUCT,)
			const sagaEntity = new OrderSagaEntity(data.orderId, data.productId, data.quantity, STEP.REMOVE_INVENTORY)

			await inboxRepository.save(inboxMessage)
			await outboxRepository.save(outboxMessage)
			await sagaRepository.save(sagaEntity)
		})
    }

    async compenstate(data: OrderSagaStepData): Promise<void> {
		// nothing to compensate, we only wrote an outbox message to the database, and the state of the saga
    }
}
