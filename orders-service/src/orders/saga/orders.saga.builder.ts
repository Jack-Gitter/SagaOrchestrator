import { UUID } from "node:crypto";
import { OrderSaga } from "./orders.saga";
import { SagaStepInterface } from "./steps/saga.step.interface";
import { OrderSagaStepData } from "./steps/types";

export class OrderSagaBuilder {

	private orderSaga: OrderSaga

	constructor(orderId: UUID, productId: number, quantity: number) {
		this.orderSaga = new OrderSaga(orderId, productId, quantity)
	}

	addStep(step: SagaStepInterface<OrderSagaStepData, OrderSagaStepData>) {
		this.orderSaga.steps.push(step)
		return this
	}

	build() {
		return this.orderSaga
	}
}
