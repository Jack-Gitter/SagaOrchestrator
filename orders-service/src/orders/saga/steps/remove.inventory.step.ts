import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";
import { STEP } from "../../../db/entities/types";
import { OrderSagaStepData } from "./types";
import { InboxMessage } from "../../../db/entities/inbox.entity";
import { OutboxMessage } from "../../../db/entities/outbox.entity";
import { OrderSagaEntity } from "../../../db/entities/saga.entity";
import { INBOX_MESSAGE_TYPE, OUTBOX_MESSAGE_TYPE } from "../../../db/types";

export class RemoveInventoryStep implements SagaStepInterface<OrderSagaStepData, OrderSagaStepData> {

	public step: STEP = STEP.REMOVE_INVENTORY

	constructor(private datasource: DataSource) {}

    async invoke(data: OrderSagaStepData): Promise<void> {
		console.log(`removing inventory for order with id ${data.orderId}`)
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)
			const existingMessage = await inboxRepository.findOneBy({id: data.messageId, messageType: INBOX_MESSAGE_TYPE.REMOVE_INVENTORY_LOCAL})
			if (existingMessage) {
				console.log(`already removed inventory for order with id ${data.orderId}, skipping`)
				return
			}
			const outboxRepository = manager.getRepository(OutboxMessage)
			const sagaRepository = manager.getRepository(OrderSagaEntity)

			const inboxMessage = new InboxMessage(data.messageId, data.orderId, INBOX_MESSAGE_TYPE.REMOVE_INVENTORY_LOCAL, true)
			const outboxMessage = new OutboxMessage(data.orderId, data.productId, data.quantity, OUTBOX_MESSAGE_TYPE.REMOVE_INVENTORY)
			const sagaEntity = new OrderSagaEntity(data.orderId, data.productId, data.quantity, STEP.REMOVE_INVENTORY)

			await inboxRepository.save(inboxMessage)
			await outboxRepository.save(outboxMessage)
			await sagaRepository.save(sagaEntity)
		})
    }

    async compenstate(data: OrderSagaStepData): Promise<void> {
		console.log(`compensating remove inventory step`)
		await this.datasource.transaction(async manager => {
			const outboxRepository = manager.getRepository(OutboxMessage)
			const existingMessage = await outboxRepository.findOneBy({orderId: data.orderId, messageType: OUTBOX_MESSAGE_TYPE.RESTORE_INVENTORY})
			if (existingMessage) {
				console.log('already compensated, skipping')
				return
			}

			const outboxMessage = new OutboxMessage(data.orderId, data.productId, data.quantity, OUTBOX_MESSAGE_TYPE.RESTORE_INVENTORY)

			await outboxRepository.save(outboxMessage)
		})
    }
}
