import { UUID } from "node:crypto";

export interface OrderSagaStepData {
	orderId: UUID,
	productId: number,
	quantity: number
}
