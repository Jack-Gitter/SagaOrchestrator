import { OrderSaga } from "./orders.saga";
import { SagaStepInterface } from "./steps/saga.step.interface";
import { OrderSagaStepData } from "./steps/types";

export class OrderSagaBuilder {

	private orderSaga: OrderSaga

	addStep(step: SagaStepInterface<OrderSagaStepData, OrderSagaStepData>) {
		this.orderSaga.steps.push(step)
		return this
	}

	build() {
		return this.orderSaga
	}
}
