import { UUID } from "node:crypto";
import { SagaStepInterface } from "./steps/saga.step.interface";
import { OrderSagaStepData } from "./steps/types";

export class OrderSaga {

	public steps: SagaStepInterface<OrderSagaStepData, OrderSagaStepData>[]
	public completed: SagaStepInterface<OrderSagaStepData, OrderSagaStepData>[]
	public index: number
	public orderId: UUID
	public productId: number
	public quantity: number

	constructor(orderId: UUID, productId: number, quantity: number) {
		this.orderId = orderId
		this.productId = productId
		this.quantity = quantity
		this.index = 0
		this.steps = []
		this.completed = []
	}

	async invokeNext() {
		await this.steps[this.index].invoke({orderId: this.orderId, productId: this.productId, quantity: this.quantity, orderSaga: this})
		this.completed.push(this.steps[this.index])
		this.index+=1
	}

	async compensate() {
		await Promise.all(this.completed.map(async step => {
			return await step.compenstate({orderId: this.orderId, productId: this.productId, quantity: this.quantity, orderSaga: this})
		}))
	}
}
