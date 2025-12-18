import { UUID } from "node:crypto";
import { OrderSaga } from "./orders.saga";
import { SagaStepInterface } from "./steps/saga.step.interface";
import { OrderSagaStepData } from "./steps/types";
import { STEP } from "src/db/entities/types";

export class OrderSagaBuilder {

	private orderSaga: OrderSaga

	constructor(orderId: UUID, productId: number, quantity: number) {
		this.orderSaga = new OrderSaga(orderId, productId, quantity)
	}

	addStep(step: SagaStepInterface<OrderSagaStepData, OrderSagaStepData>) {
		this.orderSaga.steps.push(step)
		return this
	}

	setStep(lastCompletedStep: STEP) {
		if (!lastCompletedStep) return
		for (const step of this.orderSaga.steps) {
			if (step.step === lastCompletedStep) {
				this.orderSaga.completed.push(step)
				this.orderSaga.index+=1
				return
			}
			this.orderSaga.completed.push(step)
			this.orderSaga.index+=1
		}
	}

	build() {
		return this.orderSaga
	}
}
