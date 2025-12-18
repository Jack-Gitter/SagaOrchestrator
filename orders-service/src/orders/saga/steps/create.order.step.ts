import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";
import { Order } from "src/db/entities/order.entity";
import { OutboxMessage } from "src/db/entities/outbox.entity";
import { ORDER_STATUS, OUTBOX_MESSAGE_TYPE } from "src/db/types";
import { OrderSagaStepData } from "./types";
import { OrderSagaEntity } from "src/db/entities/saga.entity";
import { LAST_COMPLETED_STEP } from "src/db/entities/types";

export class CreateOrderStep implements SagaStepInterface<OrderSagaStepData, OrderSagaStepData> {

	constructor(private datasource: DataSource) {}

    async run(data: OrderSagaStepData): Promise<void> {
		await this.datasource.transaction(async manager => {
			const orderRepository = manager.getRepository(Order)
			const outboxRepository = manager.getRepository(OutboxMessage)
			const orderSagaRepository = manager.getRepository(OrderSagaEntity)

			const existingOrder = await orderRepository.findOneBy({orderId: data.orderId})
			if (existingOrder) {
				return
			}

			const order = new Order(data.orderId, data.productId, data.quantity)
			const outboxMessage = new OutboxMessage(data.orderId, data.productId, data.quantity, OUTBOX_MESSAGE_TYPE.REMOVE_INVENTORY)
			const orderSagaEntity = new OrderSagaEntity(data.orderId, data.quantity, data.productId, LAST_COMPLETED_STEP.CREATE_ORDER)

			await orderRepository.save(order)
			await outboxRepository.save(outboxMessage)
			await orderSagaRepository.save(orderSagaEntity)
		})
    }

    async compenstate(data: OrderSagaStepData): Promise<void> {
		await this.datasource.transaction(async manager => {
			const orderRepository = manager.getRepository(Order)

			const existingOrder = await orderRepository.findOneBy({orderId: data.orderId})
			existingOrder.status = ORDER_STATUS.CANCELED

			await orderRepository.save(existingOrder)
		})

    }
}
