import { UUID } from "node:crypto";

export interface CreateOrderStepData {
	orderId: UUID,
	productId: number,
	quantity: number
}
