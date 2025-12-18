import { OrderSaga } from "./orders.saga";
import { SagaStepInterface } from "./steps/saga.step.interface";

export class OrderSagaBuilder {

	private orderSaga: OrderSaga

	addStep(step: SagaStepInterface) {
		this.orderSaga.steps.push(step)
		return this
	}

	build() {
		return this.orderSaga
	}
}
