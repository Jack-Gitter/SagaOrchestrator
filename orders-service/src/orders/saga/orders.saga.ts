import { UUID } from "node:crypto";
import { SagaStepInterface } from "./steps/saga.step.interface";

export class OrderSaga {

	public steps: SagaStepInterface<unknown, unknown>[]
	public completed: SagaStepInterface<unknown, unknown>[]
	public orderId: UUID
	public productId: number
	public quantity: number

	constructor(orderId: UUID, productId: number, quantity: number) {
		this.orderId = orderId
		this.productId = productId
		this.quantity = quantity
	}
}
