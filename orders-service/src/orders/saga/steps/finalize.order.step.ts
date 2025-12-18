import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";
import { STEP } from "../../../db/entities/types";
import { InboxMessage } from "../../../db/entities/inbox.entity";
import { OrderSagaEntity } from "../../../db/entities/saga.entity";
import { INBOX_MESSAGE_TYPE, ORDER_STATUS } from "../../../db/types";
import { OrderSagaStepData } from "./types";
import { Order } from "../../../db/entities/order.entity";

export class FinalizeOrderStep implements SagaStepInterface<OrderSagaStepData, OrderSagaStepData> {

	public step: STEP = STEP.FINALIZE_ORDER

	constructor(private datasource: DataSource) {}

    async invoke(data: OrderSagaStepData): Promise<void> {
		await this.datasource.transaction(async manager => {
			const inboxRepository = manager.getRepository(InboxMessage)
			const sagaRepository = manager.getRepository(OrderSagaEntity)
			const orderRepository = manager.getRepository(Order)

			const inboxMessage = new InboxMessage(data.messageId, data.orderId, INBOX_MESSAGE_TYPE.FINALIZE_ORDER, true)
			const sagaEntity = new OrderSagaEntity(data.orderId, data.productId, data.quantity, STEP.REMOVE_INVENTORY)
			const order = await orderRepository.findOneBy({orderId: data.orderId})
			order.status = ORDER_STATUS.FULFILLED

			await inboxRepository.save(inboxMessage)
			await sagaRepository.save(sagaEntity)
			await orderRepository.save(order)

		})
    }
    async compenstate(): Promise<void> {
		// last step, no compensation
    }
}
