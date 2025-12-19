import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";
import { Order } from "../../../db/entities/order.entity";
import { OutboxMessage } from "../../../db/entities/outbox.entity";
import { ORDER_STATUS, OUTBOX_MESSAGE_TYPE } from "../../../db/types";
import { OrderSagaStepData } from "./types";
import { OrderSagaEntity } from "../../../db/entities/saga.entity";
import { STEP } from "../../../db/entities/types";

export class CreateOrderStep implements SagaStepInterface<OrderSagaStepData, OrderSagaStepData> {

	public step: STEP = STEP.CREATE_ORDER

	constructor(private datasource: DataSource) {}

    async invoke(data: OrderSagaStepData): Promise<void> {
		console.log(`creating order with id ${data.orderId}`)
		await this.datasource.transaction(async manager => {
			const orderRepository = manager.getRepository(Order)
			const outboxRepository = manager.getRepository(OutboxMessage)
			const orderSagaRepository = manager.getRepository(OrderSagaEntity)

			const existingOrder = await orderRepository.findOneBy({orderId: data.orderId})
			if (existingOrder) {
				console.log(`already created order with id ${data.orderId}, skipping`)
				return
			}

			const order = new Order(data.orderId, data.productId, data.quantity)
			const outboxMessage = new OutboxMessage(data.orderId, data.productId, data.quantity, OUTBOX_MESSAGE_TYPE.REMOVE_INVENTORY_LOCAL)
			const orderSagaEntity = new OrderSagaEntity(data.orderId, data.quantity, data.productId, STEP.CREATE_ORDER)

			await orderRepository.save(order)
			await outboxRepository.save(outboxMessage)
			await orderSagaRepository.save(orderSagaEntity)
		})
    }

    async compenstate(data: OrderSagaStepData): Promise<void> {
		console.log(`compensating create order step`)
		await this.datasource.transaction(async manager => {
			const orderRepository = manager.getRepository(Order)

			const existingOrder = await orderRepository.findOneBy({orderId: data.orderId})
			existingOrder.status = ORDER_STATUS.CANCELED

			await orderRepository.save(existingOrder)
		})

    }
}
